import { estimateTokenCount, getWords, joinWords } from "../../utils/tokenizer.js";

/**
 * Parses markdown into discrete sections based on headings (#, ##, ###).
 *
 * @param {string} markdown
 * @returns {Array<{ heading: string, text: string, tokens: number }>}
 */
export function parseSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];

  let currentHeading = "Overview";
  let currentLines = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        const text = currentLines.join("\n").trim();
        if (text.length > 0) {
          sections.push({
            heading: currentHeading,
            text,
            tokens: estimateTokenCount(text)
          });
        }
      }
      currentHeading = headingMatch[2].trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    const text = currentLines.join("\n").trim();
    if (text.length > 0) {
      sections.push({
        heading: currentHeading,
        text,
        tokens: estimateTokenCount(text)
      });
    }
  }

  return sections;
}

/**
 * Splits a long section (> chunkSize) into multiple chunks with overlap.
 *
 * @param {{ heading: string, text: string }} section
 * @param {number} chunkSize
 * @param {number} overlap
 * @returns {Array<{ text: string, headings: string[], primaryHeading: string }>}
 */
function splitLongSection(section, chunkSize, overlap) {
  const words = getWords(section.text);
  const chunks = [];

  // Approximate wordsPerChunk from token target (~0.75 words per token)
  const wordsPerChunk = Math.max(20, Math.floor(chunkSize * 0.75));
  const wordsOverlap = Math.min(
    Math.floor(wordsPerChunk / 2),
    Math.max(5, Math.floor(overlap * 0.75))
  );
  const step = Math.max(1, wordsPerChunk - wordsOverlap);

  let start = 0;
  while (start < words.length) {
    const end = Math.min(words.length, start + wordsPerChunk);
    const chunkText = joinWords(words, start, end);

    chunks.push({
      text: chunkText,
      headings: [section.heading],
      primaryHeading: section.heading
    });

    if (end >= words.length) break;
    start += step;
  }

  return chunks;
}

/**
 * Chunks a single file's markdown text according to the rules:
 * - Chunks never cross file boundaries.
 * - Long sections are split.
 * - Short adjacent sections are merged up to chunkSize.
 * - Captures headings[] and primaryHeading.
 *
 * @param {string} markdown - Clean markdown text without front matter
 * @param {object} fileMeta - { sourceFile, topic, difficulty }
 * @param {object} options - { chunkSize, overlap }
 * @returns {Array<object>}
 */
export function chunkMarkdownFile(markdown, fileMeta, options = {}) {
  const chunkSize = options.chunkSize || 600;
  const overlap = options.overlap || 100;

  const rawSections = parseSections(markdown);
  const intermediateChunks = [];

  let currentMergedSections = [];
  let currentTokens = 0;

  const flushMergedSections = () => {
    if (currentMergedSections.length === 0) return;

    const headings = currentMergedSections.map((s) => s.heading);
    // Find the heading that contributes the most tokens
    let maxTokens = -1;
    let primaryHeading = headings[0];
    for (const s of currentMergedSections) {
      if (s.tokens > maxTokens) {
        maxTokens = s.tokens;
        primaryHeading = s.heading;
      }
    }

    const text = currentMergedSections.map((s) => s.text).join("\n\n");
    intermediateChunks.push({
      text,
      headings,
      primaryHeading
    });

    currentMergedSections = [];
    currentTokens = 0;
  };

  for (const section of rawSections) {
    // Case 1: Long section exceeds chunkSize
    if (section.tokens > chunkSize) {
      // Flush any accumulated short sections first
      flushMergedSections();
      // Split the long section
      const subChunks = splitLongSection(section, chunkSize, overlap);
      intermediateChunks.push(...subChunks);
      continue;
    }

    // Case 2: Adding this section would exceed chunkSize
    if (currentTokens + section.tokens > chunkSize && currentMergedSections.length > 0) {
      flushMergedSections();
    }

    // Accumulate section
    currentMergedSections.push(section);
    currentTokens += section.tokens;
  }

  // Flush remaining
  flushMergedSections();

  // Final mapping with chunkIndex, metadata, and token count
  return intermediateChunks.map((chunk, index) => ({
    sourceFile: fileMeta.sourceFile,
    headings: chunk.headings,
    primaryHeading: chunk.primaryHeading,
    topic: fileMeta.topic || "General",
    difficulty: fileMeta.difficulty || "medium",
    chunkIndex: index,
    chunkSize,
    text: chunk.text,
    tokenCount: estimateTokenCount(chunk.text)
  }));
}
