import { config } from "../../config/index.js";

/**
 * Executes a Gemini API generateContent call with structured responseSchema,
 * exponential backoff, and quota exhaustion detection.
 *
 * @param {object} params
 * @param {string} params.prompt - System and user instructions
 * @param {object} [params.responseSchema] - Optional JSON schema for structured generation
 * @param {string} [params.model] - Optional model override (default: config.geminiModel)
 * @param {number} [params.temperature] - Generation temperature (default: 0.2)
 * @returns {Promise<string>} Raw JSON response text
 */
export async function callGeminiStructured({
  prompt,
  responseSchema = null,
  model = config.geminiModel,
  temperature = 0.2
}) {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

  const generationConfig = {
    temperature,
    responseMimeType: "application/json"
  };

  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig
  };

  let delay = 1000;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || "";
        const isQuota =
          msg.toLowerCase().includes("quota") ||
          errData?.error?.status === "RESOURCE_EXHAUSTED";
        if (isQuota) {
          throw new Error(
            "Gemini free-tier quota exhausted. Please check your Google AI Studio quota limits."
          );
        }
        if (attempt === maxRetries) {
          throw new Error("Gemini API rate limit exceeded (429) after retry attempts.");
        }
        console.warn(`[Gemini] 429 Rate limit hit, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      if (res.status >= 500) {
        if (attempt === maxRetries) {
          throw new Error(`Gemini server error (${res.status}) after retry attempts.`);
        }
        console.warn(`[Gemini] Server error (${res.status}), retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty or malformed candidate response from Gemini API.");
      }

      return text;
    } catch (err) {
      if (attempt === maxRetries || err.message.includes("quota")) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}
