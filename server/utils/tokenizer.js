/**
 * Tokenizer utility for estimating token counts and token-based chunking.
 *
 * Approximates standard BPE tokenization for English technical text:
 * A token is roughly 4 characters or ~0.75 words on average.
 */

export function estimateTokenCount(text) {
  if (!text || typeof text !== "string") return 0;
  // Splits on words, symbols, whitespace sequences
  const tokens = text.match(/\w+|[^\w\s]|\s+/g);
  if (!tokens) return 0;

  // Filter out standalone single spaces to normalize estimation
  let count = 0;
  for (const token of tokens) {
    if (token.trim().length === 0) {
      if (token.length > 2) count += Math.floor(token.length / 2);
    } else if (token.length > 4) {
      count += Math.ceil(token.length / 4);
    } else {
      count += 1;
    }
  }
  return Math.max(1, count);
}

/**
 * Splits text into words/tokens array for precise token-window slicing.
 */
export function getWords(text) {
  if (!text) return [];
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Reconstructs a string from a slice of words, maintaining readability.
 */
export function joinWords(words, start, end) {
  return words.slice(start, end).join(" ");
}
