import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server dir
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback

export const config = {
  port: parseInt(process.env.PORT || "5050", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  // Gemini API
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || "768", 10),

  // Vector store: 'inmemory' | 'mongo'
  vectorStore: (process.env.VECTOR_STORE || "inmemory").toLowerCase(),

  // MongoDB configuration
  mongoUri: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "interview_rag",
  mongoCollection: process.env.MONGODB_COLLECTION || "kb_chunks",
  mongoIndexName: process.env.MONGODB_INDEX_NAME || "vector_index",

  // RAG defaults
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.65"),
  defaultChunkSize: parseInt(process.env.DEFAULT_CHUNK_SIZE || "600", 10),
  defaultChunkOverlap: parseInt(process.env.DEFAULT_CHUNK_OVERLAP || "100", 10),
  topK: parseInt(process.env.TOP_K || "5", 10),

  // Paths
  kbDir: path.resolve(__dirname, "../../kb"),
  cacheDir: path.resolve(__dirname, "../../.cache")
};
