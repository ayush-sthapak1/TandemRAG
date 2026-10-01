import { config } from "../../config/index.js";
import { getVectorStore, InMemoryVectorStore } from "../../vectorstore/index.js";
import { embeddingService } from "../embeddings/geminiEmbeddingService.js";
import { runIngestion } from "../ingest/ingestionService.js";

/**
 * =======================================================================
 * SIMILARITY THRESHOLD:
 * PROVISIONAL — will be replaced after retrieval evaluation in Phase 5.
 * =======================================================================
 */
export const PROVISIONAL_SIMILARITY_THRESHOLD = config.similarityThreshold || 0.65;

let isKnowledgeBaseReady = false;

/**
 * Ensures the vector store has ingested knowledge base chunks.
 */
export async function ensureKnowledgeBaseLoaded(storeType = config.vectorStore) {
  const store = getVectorStore(storeType);
  if (store instanceof InMemoryVectorStore && store.size() === 0) {
    console.log("[Retrieval] In-memory vector store is empty, initializing from KB...");
    await runIngestion({ vectorStoreType: "inmemory" });
    isKnowledgeBaseReady = true;
  } else {
    isKnowledgeBaseReady = true;
  }
  return store;
}

/**
 * Builds targeted semantic retrieval queries from candidate profile and JD requirements.
 *
 * @param {object} profile - { skills, projects, technologies }
 * @param {string} jobDescription
 * @param {string} [topicFilter]
 * @returns {string[]} Array of search query strings
 */
export function buildRetrievalQueries(profile, jobDescription, topicFilter = null) {
  const queries = [];

  // Query by high-level topic if filtered
  if (topicFilter && topicFilter.toLowerCase() !== "any") {
    queries.push(`Core interview concepts, fundamentals, and algorithms in ${topicFilter}`);
  }

  // Queries from extracted skills (batch into conceptual search phrases)
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    for (const skill of profile.skills.slice(0, 4)) {
      queries.push(`Technical interview questions and core concepts on ${skill}`);
    }
  }

  // Queries from technologies
  if (Array.isArray(profile.technologies) && profile.technologies.length > 0) {
    for (const tech of profile.technologies.slice(0, 3)) {
      queries.push(`Engineering concepts, implementation details, and interview architecture for ${tech}`);
    }
  }

  // Queries from projects (grounding candidate project contexts to technical topics)
  if (Array.isArray(profile.projects) && profile.projects.length > 0) {
    for (const project of profile.projects.slice(0, 2)) {
      queries.push(`System design, architecture, databases, and APIs related to ${project}`);
    }
  }

  // Extract a salient summary phrase from JD
  const jdFirstSentences = jobDescription
    .split(/\n|\./)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 2);

  for (const sentence of jdFirstSentences) {
    queries.push(`Key technical requirements and interview topics for: ${sentence.slice(0, 150)}`);
  }

  // Deduplicate and fallback
  const uniqueQueries = [...new Set(queries)].filter(Boolean);
  if (uniqueQueries.length === 0) {
    uniqueQueries.push("Computer science fundamentals, data structures, algorithms, and system design");
  }

  return uniqueQueries.slice(0, 8); // Bound to top 8 queries to preserve latency and quota
}

/**
 * Executes semantic retrieval across all queries:
 * 1. Embeds each query (RETRIEVAL_QUERY).
 * 2. Vector search topK per query.
 * 3. Applies similarity threshold PER QUERY.
 * 4. Records queries with insufficient coverage.
 * 5. Deduplicates and reranks qualifying chunks by similarity.
 *
 * @param {object} params
 * @param {object} params.profile - { skills, projects, technologies }
 * @param {string} params.jobDescription
 * @param {string} [params.topicFilter]
 * @param {number} [params.topKPerQuery]
 * @param {number} [params.threshold]
 * @returns {Promise<{
 *   chunks: Array<object>,
 *   queryAudit: Array<{ query: string, bestScore: number, status: string }>,
 *   insufficientCoverageQueries: string[]
 * }>}
 */
export async function retrieveRelevantKnowledge({
  profile,
  jobDescription,
  topicFilter = null,
  topKPerQuery = 3,
  threshold = PROVISIONAL_SIMILARITY_THRESHOLD
}) {
  const store = await ensureKnowledgeBaseLoaded();
  const searchQueries = buildRetrievalQueries(profile, jobDescription, topicFilter);

  const filter = topicFilter && topicFilter.toLowerCase() !== "any" ? { topic: topicFilter } : null;

  const qualifyingChunksMap = new Map(); // Keyed by sourceFile + chunkIndex + chunkSize
  const queryAudit = [];
  const insufficientCoverageQueries = [];

  for (const query of searchQueries) {
    try {
      const queryVec = await embeddingService.embedQuery(query);
      const results = await store.query(queryVec, topKPerQuery, filter);

      if (!results || results.length === 0) {
        queryAudit.push({
          query,
          bestScore: 0,
          status: "Insufficient knowledge-base coverage for this query."
        });
        insufficientCoverageQueries.push(query);
        continue;
      }

      const bestScore = results[0].similarity;

      // Apply similarity threshold PER RETRIEVAL QUERY
      if (bestScore < threshold) {
        queryAudit.push({
          query,
          bestScore,
          status: `Insufficient knowledge-base coverage for this query. (Best: ${bestScore.toFixed(3)} < ${threshold})`
        });
        insufficientCoverageQueries.push(query);
        // Do not accumulate unsupported chunks from this query
        continue;
      }

      queryAudit.push({
        query,
        bestScore,
        status: `Sufficient coverage (${bestScore.toFixed(3)} >= ${threshold})`
      });

      // Accumulate chunks from this query that meet the threshold
      for (const chunk of results) {
        if (chunk.similarity >= threshold) {
          const chunkId = `${chunk.sourceFile}::${chunk.chunkIndex}::${chunk.chunkSize}`;
          if (!qualifyingChunksMap.has(chunkId)) {
            qualifyingChunksMap.set(chunkId, { ...chunk });
          } else {
            // Keep the higher similarity score across queries
            const existing = qualifyingChunksMap.get(chunkId);
            if (chunk.similarity > existing.similarity) {
              existing.similarity = chunk.similarity;
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[Retrieval] Query failed for "${query}": ${err.message}`);
      queryAudit.push({
        query,
        bestScore: 0,
        status: `Query error: ${err.message}`
      });
      insufficientCoverageQueries.push(query);
    }
  }

  // Rerank all accumulated unique qualifying chunks by similarity descending
  const rerankedChunks = Array.from(qualifyingChunksMap.values()).sort(
    (a, b) => b.similarity - a.similarity
  );

  return {
    chunks: rerankedChunks,
    queryAudit,
    insufficientCoverageQueries
  };
}
