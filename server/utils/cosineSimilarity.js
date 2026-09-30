/**
 * Computes cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0.
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vector dimension mismatch: vecA has ${vecA.length}, vecB has ${vecB.length}`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

  // Mitigate floating-point inaccuracy outside [-1, 1]
  if (similarity > 1) return 1;
  if (similarity < -1) return -1;

  return similarity;
}
