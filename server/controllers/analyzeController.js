import { analyzeRequestSchema } from "../utils/validationSchemas.js";
import { extractCandidateProfile } from "../services/llm/profileExtractor.js";

/**
 * Controller for POST /api/analyze (Optional preview endpoint)
 */
export async function analyzeProfileController(req, res, next) {
  try {
    const validatedBody = analyzeRequestSchema.parse(req.body);
    const { resumeText, jobDescription } = validatedBody;

    console.log("[Analyze] Extracting candidate technical profile...");
    const profile = await extractCandidateProfile(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (err) {
    next(err);
  }
}
