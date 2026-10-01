import { z } from "zod";

// Input character limits
export const MAX_RESUME_LENGTH = 50000;
export const MAX_JD_LENGTH = 20000;
export const MAX_ANSWER_LENGTH = 10000;

/**
 * Request validation schema for POST /api/analyze
 */
export const analyzeRequestSchema = z.object({
  resumeText: z
    .string()
    .min(10, "Resume text must be at least 10 characters")
    .max(MAX_RESUME_LENGTH, `Resume text cannot exceed ${MAX_RESUME_LENGTH} characters`),
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters")
    .max(MAX_JD_LENGTH, `Job description cannot exceed ${MAX_JD_LENGTH} characters`)
});

/**
 * Request validation schema for POST /api/questions
 */
export const questionsRequestSchema = z.object({
  resume: z
    .string()
    .min(10, "Resume text must be at least 10 characters")
    .max(MAX_RESUME_LENGTH, `Resume text cannot exceed ${MAX_RESUME_LENGTH} characters`),
  jobDescription: z
    .string()
    .min(10, "Job description must be at least 10 characters")
    .max(MAX_JD_LENGTH, `Job description cannot exceed ${MAX_JD_LENGTH} characters`),
  numberOfQuestions: z
    .number()
    .int()
    .min(1, "Minimum number of questions is 1")
    .max(10, "Maximum number of questions is 10")
    .default(5),
  difficulty: z
    .enum(["easy", "medium", "hard", "any"])
    .default("medium"),
  topicFilter: z.string().optional()
});

/**
 * Zod schema for profile extraction LLM output
 */
export const profileExtractionSchema = z.object({
  skills: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([])
});

/**
 * Citation schema
 */
export const citationSchema = z.object({
  sourceFile: z.string().min(1, "sourceFile is required"),
  heading: z.string().min(1, "heading is required")
});

/**
 * Single generated interview question schema
 */
export const singleQuestionSchema = z.object({
  question: z.string().min(5, "Question text is required"),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  type: z.literal("technical").default("technical"),
  expectedAnswer: z
    .array(z.string())
    .min(3, "Expected answer must contain at least 3 points")
    .max(5, "Expected answer cannot contain more than 5 points"),
  followUps: z
    .array(z.string())
    .length(2, "Follow-ups must contain exactly 2 questions"),
  citations: z
    .array(citationSchema)
    .min(1, "Every question must contain at least one citation")
});

/**
 * Generated questions payload from LLM
 */
export const generatedQuestionsListSchema = z.object({
  questions: z.array(singleQuestionSchema)
});

/**
 * Evaluation request schema (Practice mode)
 */
export const evaluationRequestSchema = z.object({
  question: z.string().min(5),
  answer: z
    .string()
    .min(1, "Answer cannot be empty")
    .max(MAX_ANSWER_LENGTH, `Answer cannot exceed ${MAX_ANSWER_LENGTH} characters`),
  citations: z
    .array(citationSchema)
    .min(1, "At least one citation is required")
    .max(5, "Maximum 5 citations allowed per evaluation request")
});
