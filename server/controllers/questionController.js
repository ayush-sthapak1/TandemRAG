import { questionsRequestSchema } from "../utils/validationSchemas.js";
import { extractCandidateProfile } from "../services/llm/profileExtractor.js";
import { retrieveRelevantKnowledge } from "../services/retrieval/retrievalService.js";
import { generatePersonalizedQuestions } from "../services/llm/questionGenerator.js";

/**
 * Controller for POST /api/questions
 *
 * Full pipeline:
 * 1. Validate request inputs with Zod
 * 2. Extract profile internally
 * 3. Build semantic retrieval queries
 * 4. Retrieve knowledge base chunks (deduplicated, reranked, per-query similarity threshold)
 * 5. Single LLM call for all N questions
 * 6. Zod schema validation
 * 7. Validate citations against retrieved chunk headings[]
 * 8. Return grounded questions
 */
export async function generateQuestionsController(req, res, next) {
  try {
    const validatedInput = questionsRequestSchema.parse(req.body);
    const { resume, jobDescription, numberOfQuestions, difficulty, topicFilter } = validatedInput;

    console.log(
      `[Questions] Processing request: ${numberOfQuestions} questions, difficulty=${difficulty}, topic=${topicFilter || "any"}`
    );

    // Step 1: Internal Profile Extraction
    console.log("[Questions] Step 1: Extracting candidate profile...");
    const profile = await extractCandidateProfile(resume, jobDescription);

    // Step 2 & 3: Semantic Retrieval & Per-query Thresholding
    console.log("[Questions] Step 2: Retrieving knowledge base grounding chunks...");
    const { chunks: retrievedChunks, queryAudit, insufficientCoverageQueries } =
      await retrieveRelevantKnowledge({
        profile,
        jobDescription,
        topicFilter,
        topKPerQuery: 3
      });

    if (retrievedChunks.length === 0) {
      return res.status(422).json({
        success: false,
        error: "Insufficient knowledge-base coverage to ground questions for the provided resume and job description.",
        insufficientCoverageQueries
      });
    }

    console.log(
      `[Questions] Retrieved ${retrievedChunks.length} unique qualifying chunks passing similarity threshold.`
    );

    // Step 4 & 5: Single-call Question Generation and Citation Validation
    console.log("[Questions] Step 3: Generating personalized questions via Gemini 3.5 Flash...");
    const result = await generatePersonalizedQuestions({
      resume,
      jobDescription,
      numberOfQuestions,
      difficulty,
      topicFilter,
      retrievedChunks
    });

    console.log(
      `[Questions] Generation complete: ${result.validQuestionsCount} valid questions (${result.droppedQuestionsCount} dropped due to citation mismatch).`
    );

    return res.status(200).json({
      success: true,
      questions: result.questions,
      meta: {
        totalGenerated: result.totalGenerated,
        validCount: result.validQuestionsCount,
        droppedCount: result.droppedQuestionsCount,
        profileSummary: {
          skillsCount: profile.skills.length,
          projectsCount: profile.projects.length,
          technologiesCount: profile.technologies.length
        },
        retrievedChunksCount: retrievedChunks.length,
        insufficientCoverageCount: insufficientCoverageQueries.length
      }
    });
  } catch (err) {
    next(err);
  }
}
