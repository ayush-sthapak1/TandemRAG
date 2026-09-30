import { MongoClient } from "mongodb";
import { VectorStore } from "./VectorStore.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

/**
 * MongoDB Atlas Vector Search implementation of VectorStore.
 */
export class MongoVectorStore extends VectorStore {
  constructor(options = {}) {
    super();
    this.uri = options.uri;
    this.dbName = options.dbName || "interview_rag";
    this.collectionName = options.collectionName || "kb_chunks";
    this.indexName = options.indexName || "vector_index";
    this.client = null;
    this.collection = null;
  }

  async connect() {
    if (this.collection) return this.collection;
    if (!this.uri) {
      throw new Error("MONGODB_URI is required for MongoVectorStore.");
    }
    this.client = new MongoClient(this.uri, {
      serverSelectionTimeoutMS: 5000
    });
    await this.client.connect();
    const db = this.client.db(this.dbName);
    this.collection = db.collection(this.collectionName);

    // Create unique compound index on identity fields to prevent duplicates
    await this.collection.createIndex(
      { sourceFile: 1, chunkIndex: 1, chunkSize: 1 },
      { unique: true }
    );

    return this.collection;
  }

  async upsert(chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) return 0;
    const col = await this.connect();

    const operations = chunks.map((chunk) => {
      const filter = {
        sourceFile: chunk.sourceFile,
        chunkIndex: chunk.chunkIndex,
        chunkSize: chunk.chunkSize
      };
      return {
        updateOne: {
          filter,
          update: { $set: chunk },
          upsert: true
        }
      };
    });

    const res = await col.bulkWrite(operations);
    return (res.upsertedCount || 0) + (res.modifiedCount || 0);
  }

  async query(queryVector, topK = 5, filter = null) {
    const col = await this.connect();

    try {
      // Atlas Vector Search aggregation pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: this.indexName,
            path: "embedding",
            queryVector,
            numCandidates: Math.max(topK * 10, 50),
            limit: topK,
            ...(filter?.topic ? { filter: { topic: filter.topic } } : {})
          }
        },
        {
          $project: {
            _id: 0,
            sourceFile: 1,
            headings: 1,
            primaryHeading: 1,
            topic: 1,
            difficulty: 1,
            chunkIndex: 1,
            chunkSize: 1,
            text: 1,
            similarity: { $meta: "vectorSearchScore" }
          }
        }
      ];

      const results = await col.aggregate(pipeline).toArray();
      return results;
    } catch (err) {
      // If Atlas Vector Search index is not yet built, log clear actionable message
      console.warn(
        `Atlas $vectorSearch failed (${err.message}). Falling back to in-memory cosine ranking over MongoDB documents.`
      );

      const queryObj = {};
      if (filter?.topic) queryObj.topic = filter.topic;

      const docs = await col.find(queryObj).toArray();
      const scored = docs
        .filter((d) => Array.isArray(d.embedding))
        .map((d) => ({
          sourceFile: d.sourceFile,
          headings: d.headings,
          primaryHeading: d.primaryHeading,
          topic: d.topic,
          difficulty: d.difficulty,
          chunkIndex: d.chunkIndex,
          chunkSize: d.chunkSize,
          text: d.text,
          similarity: cosineSimilarity(queryVector, d.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return scored;
    }
  }

  async getAll() {
    const col = await this.connect();
    return await col.find({}, { projection: { _id: 0 } }).toArray();
  }

  async clear() {
    const col = await this.connect();
    await col.deleteMany({});
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.collection = null;
    }
  }
}
