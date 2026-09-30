import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { config } from "../../config/index.js";
import { chunkMarkdownFile } from "../chunker/chunker.js";
import { embeddingService } from "../embeddings/geminiEmbeddingService.js";
import { getVectorStore } from "../../vectorstore/index.js";

/**
 * Scans a directory recursively for markdown files.
 */
export function getMarkdownFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Executes the full ingestion pipeline:
 * 1. Reads KB markdown files
 * 2. Parses front-matter
 * 3. Chunks documents
 * 4. Batches and caches embeddings
 * 5. Upserts into VectorStore idempotently
 *
 * @param {object} options
 * @param {number} [options.chunkSize]
 * @param {number} [options.overlap]
 * @param {string} [options.vectorStoreType]
 * @param {boolean} [options.skipEmbeddings] For dry-run or testing
 * @returns {Promise<object>} Summary statistics of ingestion
 */
export async function runIngestion(options = {}) {
  const kbDir = options.kbDir || config.kbDir;
  const chunkSize = options.chunkSize || config.defaultChunkSize;
  const overlap = options.overlap || config.defaultChunkOverlap;
  const vectorStoreType = options.vectorStoreType || config.vectorStore;
  const skipEmbeddings = options.skipEmbeddings || false;

  console.log(`[Ingest] Starting ingestion from: ${kbDir}`);
  console.log(`[Ingest] Configuration: chunkSize=${chunkSize}, overlap=${overlap}, store=${vectorStoreType}`);

  const files = getMarkdownFiles(kbDir);
  if (files.length === 0) {
    throw new Error(`No markdown files found in knowledge base directory: ${kbDir}`);
  }

  const allChunks = [];

  for (const filePath of files) {
    const rawContent = fs.readFileSync(filePath, "utf8");
    const { data: frontMatter, content } = matter(rawContent);

    // Compute relative source path from kbDir (e.g. "dsa/arrays.md")
    const relativeSource = path.relative(kbDir, filePath).replace(/\\/g, "/");

    const fileMeta = {
      sourceFile: relativeSource,
      topic: frontMatter.topic || path.basename(path.dirname(filePath)).toUpperCase(),
      difficulty: frontMatter.difficulty || "medium"
    };

    const fileChunks = chunkMarkdownFile(content, fileMeta, { chunkSize, overlap });
    allChunks.push(...fileChunks);
  }

  console.log(`[Ingest] Generated ${allChunks.length} chunks across ${files.length} KB files.`);

  let embedStats = { total: allChunks.length, cacheHits: 0, newEmbeddings: 0 };

  if (!skipEmbeddings) {
    console.log(`[Ingest] Generating/loading embeddings with model: ${config.geminiEmbeddingModel}...`);
    embedStats = await embeddingService.embedDocumentChunks(allChunks, 10);
    console.log(
      `[Ingest] Embeddings complete: ${embedStats.cacheHits} cached, ${embedStats.newEmbeddings} newly fetched.`
    );
  }

  const store = getVectorStore(vectorStoreType);
  const upsertedCount = await store.upsert(allChunks);

  console.log(`[Ingest] Successfully upserted ${upsertedCount} chunks into ${vectorStoreType} vector store.`);

  return {
    filesProcessed: files.length,
    chunksCreated: allChunks.length,
    cacheHits: embedStats.cacheHits,
    newEmbeddings: embedStats.newEmbeddings,
    upsertedCount,
    chunks: allChunks
  };
}
