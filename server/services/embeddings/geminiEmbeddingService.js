import crypto from "crypto";
import fs from "fs";
import path from "path";
import { config } from "../../config/index.js";

/**
 * Computes the cache key for an embedding:
 * hash(modelName + chunkText)
 *
 * Changing either the model or chunk text automatically invalidates the cache.
 */
export function getEmbeddingCacheKey(modelName, text) {
  return crypto
    .createHash("sha256")
    .update(`${modelName}:${text}`)
    .digest("hex");
}

export class GeminiEmbeddingService {
  constructor(options = {}) {
    this.apiKey = options.apiKey || config.geminiApiKey;
    this.modelName = options.modelName || config.geminiEmbeddingModel;
    this.dimension = options.dimension || config.embeddingDimension;
    this.cacheDir = options.cacheDir || config.cacheDir;
    this.cacheFilePath = path.join(this.cacheDir, "embedding_cache.json");
    this.cache = new Map();
    this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, "utf8");
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.cache.set(k, v);
        }
      }
    } catch (err) {
      console.warn("Could not read embedding cache, starting fresh:", err.message);
    }
  }

  saveCache() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      const obj = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      console.warn("Could not persist embedding cache:", err.message);
    }
  }

  /**
   * Helper to execute a fetch request with exponential backoff on 429 or 5xx.
   */
  async fetchWithRetry(url, requestBody, maxRetries = 4) {
    let delay = 1000;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        if (res.status === 429) {
          const errBody = await res.json().catch(() => ({}));
          const isQuota =
            errBody?.error?.message?.toLowerCase().includes("quota") ||
            errBody?.error?.status === "RESOURCE_EXHAUSTED";
          if (isQuota) {
            throw new Error(
              "Gemini API quota exhausted. Please check your Google AI Studio plan/quota."
            );
          }
          if (attempt === maxRetries) {
            throw new Error("Gemini rate limit exceeded (429) after max retries.");
          }
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        if (res.status >= 500) {
          if (attempt === maxRetries) {
            throw new Error(`Gemini server error (${res.status}) after max retries.`);
          }
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(`Gemini API error: ${data.error.message}`);
        }
        return data;
      } catch (err) {
        if (attempt === maxRetries || err.message.includes("quota")) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Embeds a single query string using RETRIEVAL_QUERY task type.
   *
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embedQuery(text) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required to generate embeddings.");
    }

    const cacheKey = getEmbeddingCacheKey(this.modelName, `QUERY:${text}`);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:embedContent?key=${this.apiKey}`;
    const body = {
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_QUERY"
    };
    if (this.dimension) {
      body.outputDimensionality = this.dimension;
    }

    const data = await this.fetchWithRetry(url, body);
    const vector = data.embedding?.values;
    if (!vector || !Array.isArray(vector)) {
      throw new Error("Invalid embedding response from Gemini API.");
    }

    this.cache.set(cacheKey, vector);
    this.saveCache();
    return vector;
  }

  /**
   * Embeds an array of document chunks in batches using RETRIEVAL_DOCUMENT task type.
   * Leverages the disk cache for all previously computed hashes.
   *
   * @param {Array<object>} chunks
   * @param {number} batchSize
   * @returns {Promise<Array<object>>} - Chunks augmented with .embedding
   */
  async embedDocumentChunks(chunks, batchSize = 10) {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is required to generate embeddings.");
    }

    let cacheHits = 0;
    let newEmbeddingsCount = 0;

    const uncachedIndices = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const cacheKey = getEmbeddingCacheKey(this.modelName, chunk.text);
      if (this.cache.has(cacheKey)) {
        chunk.embedding = this.cache.get(cacheKey);
        cacheHits++;
      } else {
        uncachedIndices.push(i);
      }
    }

    // Process uncached chunks in batches
    for (let i = 0; i < uncachedIndices.length; i += batchSize) {
      const batchIndices = uncachedIndices.slice(i, i + batchSize);

      await Promise.all(
        batchIndices.map(async (idx) => {
          const chunk = chunks[idx];
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:embedContent?key=${this.apiKey}`;
          const body = {
            content: { parts: [{ text: chunk.text }] },
            taskType: "RETRIEVAL_DOCUMENT",
            title: chunk.primaryHeading || chunk.sourceFile
          };
          if (this.dimension) {
            body.outputDimensionality = this.dimension;
          }

          const data = await this.fetchWithRetry(url, body);
          const vector = data.embedding?.values;
          if (!vector || !Array.isArray(vector)) {
            throw new Error(`Failed to generate embedding for chunk in ${chunk.sourceFile}`);
          }

          chunk.embedding = vector;
          const cacheKey = getEmbeddingCacheKey(this.modelName, chunk.text);
          this.cache.set(cacheKey, vector);
          newEmbeddingsCount++;
        })
      );

      // Save cache progressively per batch
      this.saveCache();
    }

    return {
      chunks,
      total: chunks.length,
      cacheHits,
      newEmbeddings: newEmbeddingsCount
    };
  }
}

export const embeddingService = new GeminiEmbeddingService();
