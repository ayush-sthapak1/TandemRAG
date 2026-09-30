import { config } from "../config/index.js";
import { InMemoryVectorStore } from "./InMemoryVectorStore.js";
import { MongoVectorStore } from "./MongoVectorStore.js";

// Singleton instances for the application lifecycle
let activeStoreInstance = null;

/**
 * Creates or retrieves the configured VectorStore instance.
 *
 * @param {string} [type] Optional override ('inmemory' | 'mongo')
 * @returns {VectorStore}
 */
export function getVectorStore(type) {
  const storeType = (type || config.vectorStore || "inmemory").toLowerCase();

  if (storeType === "mongo") {
    return new MongoVectorStore({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      collectionName: config.mongoCollection,
      indexName: config.mongoIndexName
    });
  }

  // Default to InMemoryVectorStore
  if (!activeStoreInstance || !(activeStoreInstance instanceof InMemoryVectorStore)) {
    activeStoreInstance = new InMemoryVectorStore();
  }
  return activeStoreInstance;
}

export { InMemoryVectorStore, MongoVectorStore };
