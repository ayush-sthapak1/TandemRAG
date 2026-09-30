import { VectorStore } from "./VectorStore.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

/**
 * In-memory implementation of VectorStore using cosine similarity.
 * Uses an internal Map keyed by `sourceFile + chunkIndex + chunkSize`
 * to guarantee idempotency.
 */
export class InMemoryVectorStore extends VectorStore {
  constructor() {
    super();
    this.storage = new Map();
  }

  /**
   * Generates unique identity key for a chunk:
   * sourceFile + chunkIndex + chunkSize
   */
  static getChunkKey(chunk) {
    return `${chunk.sourceFile}::${chunk.chunkIndex}::${chunk.chunkSize}`;
  }

  /**
   * Upserts an array of chunks into in-memory map.
   *
   * @param {Array<object>} chunks
   * @returns {Promise<number>}
   */
  async upsert(chunks) {
    if (!Array.isArray(chunks)) return 0;

    let count = 0;
    for (const chunk of chunks) {
      if (!chunk.sourceFile || chunk.chunkIndex === undefined || !chunk.chunkSize) {
        throw new Error(
          "Chunk missing required identity fields (sourceFile, chunkIndex, chunkSize)"
        );
      }
      const key = InMemoryVectorStore.getChunkKey(chunk);
      this.storage.set(key, { ...chunk });
      count++;
    }
    return count;
  }

  /**
   * Queries the in-memory store using cosine similarity.
   *
   * @param {number[]} queryVector
   * @param {number} topK
   * @param {object} [filter] Optional filter, e.g. { topic: 'DSA' }
   * @returns {Promise<Array<object>>}
   */
  async query(queryVector, topK = 5, filter = null) {
    if (!queryVector || queryVector.length === 0) {
      return [];
    }

    const scored = [];

    for (const chunk of this.storage.values()) {
      // Apply topic or metadata filter if provided
      if (filter) {
        if (filter.topic && chunk.topic.toLowerCase() !== filter.topic.toLowerCase()) {
          continue;
        }
        if (filter.sourceFile && chunk.sourceFile !== filter.sourceFile) {
          continue;
        }
      }

      if (!chunk.embedding || !Array.isArray(chunk.embedding)) {
        continue;
      }

      const similarity = cosineSimilarity(queryVector, chunk.embedding);
      scored.push({
        ...chunk,
        similarity
      });
    }

    // Sort descending by similarity
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, topK);
  }

  /**
   * Retrieves all stored chunks.
   */
  async getAll() {
    return Array.from(this.storage.values());
  }

  /**
   * Clears the in-memory store.
   */
  async clear() {
    this.storage.clear();
  }

  /**
   * Returns current count of chunks.
   */
  size() {
    return this.storage.size;
  }
}
