import { Router } from "express";
import rateLimit from "express-rate-limit";
import { upload, parseResumeController } from "../controllers/resumeController.js";
import { analyzeProfileController } from "../controllers/analyzeController.js";
import { generateQuestionsController } from "../controllers/questionController.js";

const router = Router();

// Rate Limiting to prevent quota exhaustion and DoS
const parseResumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 uploads per IP per 15m
  message: {
    success: false,
    error: "Too many resume parse requests. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const llmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 generation requests per IP per 15m
  message: {
    success: false,
    error: "Too many AI generation requests. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "InterviewRAG API",
    version: "1.0.0"
  });
});

// Resume parsing: accepts PDF or plain text
router.post(
  "/parse-resume",
  parseResumeLimiter,
  upload.single("resume"),
  parseResumeController
);

// Profile extraction (optional preview)
router.post(
  "/analyze",
  llmLimiter,
  analyzeProfileController
);

// Question generation: profile extraction + semantic retrieval + grounded generation
router.post(
  "/questions",
  llmLimiter,
  generateQuestionsController
);

export default router;
