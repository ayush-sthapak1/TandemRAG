import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Retrieval Similarity Threshold Logic Unit Tests", () => {
  // Simulates per-query threshold filtering logic
  function filterByPerQueryThreshold(queryResults, threshold) {
    const qualifying = [];
    const insufficientQueries = [];

    for (const { query, hits } of queryResults) {
      if (!hits || hits.length === 0) {
        insufficientQueries.push(query);
        continue;
      }
      const bestScore = hits[0].similarity;
      // Per-query threshold check
      if (bestScore < threshold) {
        insufficientQueries.push(query);
        continue;
      }

      // Add only chunks meeting or exceeding the threshold
      for (const chunk of hits) {
        if (chunk.similarity >= threshold) {
          qualifying.push(chunk);
        }
      }
    }

    return { qualifying, insufficientQueries };
  }

  const threshold = 0.65; // Provisional threshold

  test("accumulates chunks when best query score is above threshold", () => {
    const queryResults = [
      {
        query: "Dynamic programming knapsack",
        hits: [
          { id: "c1", sourceFile: "dsa/dynamic-programming.md", similarity: 0.82 },
          { id: "c2", sourceFile: "dsa/dynamic-programming.md", similarity: 0.70 }
        ]
      }
    ];

    const { qualifying, insufficientQueries } = filterByPerQueryThreshold(queryResults, threshold);
    assert.strictEqual(qualifying.length, 2);
    assert.strictEqual(insufficientQueries.length, 0);
  });

  test("drops query and records insufficient coverage when best score is below threshold", () => {
    const queryResults = [
      {
        query: "Unrelated quantum computing hardware query",
        hits: [
          { id: "c3", sourceFile: "os/deadlocks.md", similarity: 0.45 },
          { id: "c4", sourceFile: "networks/dns.md", similarity: 0.38 }
        ]
      }
    ];

    const { qualifying, insufficientQueries } = filterByPerQueryThreshold(queryResults, threshold);
    assert.strictEqual(qualifying.length, 0);
    assert.strictEqual(insufficientQueries.length, 1);
    assert.strictEqual(insufficientQueries[0], "Unrelated quantum computing hardware query");
  });

  test("applies threshold independently per query (not per topic)", () => {
    const queryResults = [
      {
        query: "Query A (High relevance)",
        hits: [
          { id: "c1", sourceFile: "web/jwt-auth.md", similarity: 0.88 },
          { id: "c2", sourceFile: "web/jwt-auth.md", similarity: 0.60 } // individual hit below threshold
        ]
      },
      {
        query: "Query B (Low relevance)",
        hits: [
          { id: "c3", sourceFile: "web/react-hooks.md", similarity: 0.58 } // best hit below threshold
        ]
      }
    ];

    const { qualifying, insufficientQueries } = filterByPerQueryThreshold(queryResults, threshold);
    // Query A best hit 0.88 >= 0.65 -> qualifies; c1 included (0.88 >= 0.65), c2 excluded (0.60 < 0.65)
    assert.strictEqual(qualifying.length, 1);
    assert.strictEqual(qualifying[0].id, "c1");
    // Query B best hit 0.58 < 0.65 -> entire query rejected
    assert.strictEqual(insufficientQueries.length, 1);
    assert.strictEqual(insufficientQueries[0], "Query B (Low relevance)");
  });
});
