import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

describe("cosineSimilarity unit tests", () => {
  test("returns 1.0 for identical vectors", () => {
    const vecA = [1, 2, 3, 4];
    const vecB = [1, 2, 3, 4];
    const sim = cosineSimilarity(vecA, vecB);
    assert.ok(Math.abs(sim - 1.0) < 1e-6, `Expected ~1.0, got ${sim}`);
  });

  test("returns 0.0 for orthogonal vectors", () => {
    const vecA = [1, 0];
    const vecB = [0, 1];
    const sim = cosineSimilarity(vecA, vecB);
    assert.strictEqual(sim, 0.0);
  });

  test("returns -1.0 for diametrically opposed vectors", () => {
    const vecA = [1, 0];
    const vecB = [-1, 0];
    const sim = cosineSimilarity(vecA, vecB);
    assert.ok(Math.abs(sim - -1.0) < 1e-6);
  });

  test("computes correct known cosine similarity value", () => {
    // vecA = [3, 4], norm = 5
    // vecB = [4, 3], norm = 5
    // dot = 12 + 12 = 24, sim = 24 / 25 = 0.96
    const sim = cosineSimilarity([3, 4], [4, 3]);
    assert.ok(Math.abs(sim - 0.96) < 1e-6);
  });

  test("returns 0 for zero vectors without crashing", () => {
    assert.strictEqual(cosineSimilarity([0, 0], [1, 2]), 0);
    assert.strictEqual(cosineSimilarity([], []), 0);
  });

  test("throws error on vector dimension mismatch", () => {
    assert.throws(
      () => cosineSimilarity([1, 2], [1, 2, 3]),
      /Vector dimension mismatch/
    );
  });
});
