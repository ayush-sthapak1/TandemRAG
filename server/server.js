import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import multer from "multer";
import { config } from "./config/index.js";
import apiRouter from "./routes/api.js";
import { ensureKnowledgeBaseLoaded } from "./services/retrieval/retrievalService.js";

const app = express();

// CORS configuration restricted via environment variable
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    const allowed = config.corsOrigin.split(",").map((s) => s.trim());
    if (allowed.includes("*") || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing with 2 MB payload limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Request Timeout Middleware (60s)
app.use((req, res, next) => {
  res.setTimeout(60000, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: "Request timed out while processing."
      });
    }
  });
  next();
});

// API Routes
app.use("/api", apiRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      issues
    });
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum allowed file size is 2 MB."
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  // Handle custom bad request or domain errors
  const statusCode = err.statusCode || (err.message.includes("Unsupported file type") ? 400 : 500);
  const message = err.message || "An unexpected internal server error occurred.";

  console.error(`[Error ${statusCode}] ${req.method} ${req.url}:`, message);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(config.nodeEnv === "development" && { stack: err.stack })
  });
});

// Server Initialization
export async function startServer(port = config.port) {
  try {
    // Preload knowledge base into vector store on startup
    await ensureKnowledgeBaseLoaded();

    const server = app.listen(port, () => {
      console.log(`[InterviewRAG Server] Running on http://localhost:${port}`);
      console.log(`[InterviewRAG Server] VectorStore: ${config.vectorStore}, Model: ${config.geminiModel}`);
    });
    return server;
  } catch (err) {
    console.error("[InterviewRAG Server] Failed to start:", err);
    process.exit(1);
  }
}

// Auto-start when executed directly
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  startServer();
}

export default app;
