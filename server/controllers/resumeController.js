import multer from "multer";
import pdfParse from "pdf-parse";

// Memory storage strictly ensures no uploaded file touches disk
const storage = multer.memoryStorage();

// Accept PDF or Plain text up to 2 MB
export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB maximum
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["application/pdf", "text/plain"];
    if (
      allowedMimeTypes.includes(file.mimetype) ||
      file.originalname.endsWith(".pdf") ||
      file.originalname.endsWith(".txt")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only PDF and plain text (.txt) files are accepted."));
    }
  }
});

/**
 * Controller for POST /api/parse-resume
 * Extracts text from uploaded PDF or plain text file.
 * NEVER persists, stores, or logs resume content.
 */
export async function parseResumeController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a PDF or plain text file under 2 MB."
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Log operational metadata only (NEVER log resume text)
    console.log(`[ResumeParser] Processing uploaded file: "${originalname}" (${mimetype}, ${size} bytes)`);

    let extractedText = "";

    if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
    } else {
      // Plain text
      extractedText = buffer.toString("utf8");
    }

    const cleanText = extractedText.trim();
    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: "Extracted file content is empty or unreadable."
      });
    }

    return res.status(200).json({
      success: true,
      text: cleanText
    });
  } catch (err) {
    next(err);
  }
}
