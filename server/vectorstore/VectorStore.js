/**
 * Abstract Base Class for VectorStore implementations.
 */
export class VectorStore {
  /**
   * Upsert chunks into the vector store.
   *
   * @param {Array<object>} chunks
   * @returns {Promise<number>} Number of chunks upserted
   */
  async upsert(chunks) {
    throw new Error("Method 'upsert()' must be implemented by subclass.");
  }

  /**
   * Query the vector store for the top-K nearest chunks to a query vector.
   *
   * @param {number[]} queryVector
   * @param {number} topK
   * @param {object} [filter] Optional filter criteria (e.g. { topic: 'DSA' })
   * @returns {Promise<Array<object>>} Chunks sorted by similarity descending with .similarity score
   */
  async query(queryVector, topK = 5, filter = null) {
    throw new Error("Method 'query()' must be implemented by subclass.");
  }

  /**
   * Helper to retrieve all chunks (useful for evaluation, reference lookup, inspection).
   *
   * @returns {Promise<Array<object>>}
   */
  async getAll() {
    throw new Error("Method 'getAll()' must be implemented by subclass.");
  }

  /**
   * Clean or clear the store if supported.
   */
  async clear() {
    throw new Error("Method 'clear()' must be implemented by subclass.");
  }
}
