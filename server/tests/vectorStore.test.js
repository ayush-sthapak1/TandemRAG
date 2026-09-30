import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { InMemoryVectorStore } from "../vectorstore/InMemoryVectorStore.js";
import { getEmbeddingCacheKey } from "../services/embeddings/geminiEmbeddingService.js";

describe("VectorStore and Cache Key Unit Tests", () => {
  test("InMemoryVectorStore upserts idempotently using sourceFile + chunkIndex + chunkSize", async () => {
    const store = new InMemoryVectorStore();

    const chunk1 = {
      sourceFile: "dsa/arrays.md",
      chunkIndex: 0,
      chunkSize: 600,
      headings: ["Array Basics"],
      primaryHeading: "Array Basics",
      topic: "DSA",
      difficulty: "medium",
      text: "Array text version 1",
      embedding: [1, 0, 0]
    };

    const chunk2 = {
      sourceFile: "dsa/arrays.md",
      chunkIndex: 1,
      chunkSize: 600,
      headings: ["Two Pointers"],
      primaryHeading: "Two Pointers",
      topic: "DSA",
      difficulty: "medium",
      text: "Two pointer text",
      embedding: [0, 1, 0]
    };

    await store.upsert([chunk1, chunk2]);
    assert.strictEqual(store.size(), 2);

    // Re-upserting identical identity with updated text should replace, NOT duplicate
    const chunk1Updated = {
      ...chunk1,
      text: "Array text version 2 (updated)"
    };

    await store.upsert([chunk1Updated]);
    assert.strictEqual(store.size(), 2, "Store size must remain 2 after re-upserting same chunk identity");

    const all = await store.getAll();
    const retrieved = all.find((c) => c.chunkIndex === 0);
    assert.strictEqual(retrieved.text, "Array text version 2 (updated)");
  });

  test("InMemoryVectorStore ranks queries by cosine similarity and respects filters", async () => {
    const store = new InMemoryVectorStore();

    await store.upsert([
      {
        sourceFile: "dsa/arrays.md",
        chunkIndex: 0,
        chunkSize: 600,
        headings: ["Arrays"],
        primaryHeading: "Arrays",
        topic: "DSA",
        difficulty: "easy",
        text: "Arrays content",
        embedding: [1, 0, 0]
      },
      {
        sourceFile: "os/threads.md",
        chunkIndex: 0,
        chunkSize: 600,
        headings: ["Threads"],
        primaryHeading: "Threads",
        topic: "OS",
        difficulty: "medium",
        text: "Threads content",
        embedding: [0.8, 0.6, 0] // similarity ~0.8 with [1, 0, 0]
      },
      {
        sourceFile: "dbms/indexing.md",
        chunkIndex: 0,
        chunkSize: 600,
        headings: ["B+ Trees"],
        primaryHeading: "B+ Trees",
        topic: "DBMS",
        difficulty: "hard",
        text: "Indexing content",
        embedding: [0, 1, 0] // orthogonal, sim = 0 with [1, 0, 0]
      }
    ]);

    // Query with vector [1, 0, 0]
    const results = await store.query([1, 0, 0], 3);
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].sourceFile, "dsa/arrays.md");
    assert.ok(Math.abs(results[0].similarity - 1.0) < 1e-5);
    assert.strictEqual(results[1].sourceFile, "os/threads.md");
    assert.ok(Math.abs(results[1].similarity - 0.8) < 1e-5);

    // Query with topic filter
    const osResults = await store.query([1, 0, 0], 3, { topic: "OS" });
    assert.strictEqual(osResults.length, 1);
    assert.strictEqual(osResults[0].sourceFile, "os/threads.md");
  });

  test("getEmbeddingCacheKey derives stable hash from modelName + chunkText", () => {
    const model = "gemini-embedding-001";
    const text = "Sample chunk text for hashing";

    const hash1 = getEmbeddingCacheKey(model, text);
    const hash2 = getEmbeddingCacheKey(model, text);
    assert.strictEqual(hash1, hash2, "Identical inputs must yield identical hash");

    const hashDifferentModel = getEmbeddingCacheKey("gemini-embedding-2", text);
    assert.notStrictEqual(hash1, hashDifferentModel, "Changing model must change hash");

    const hashDifferentText = getEmbeddingCacheKey(model, text + " altered");
    assert.notStrictEqual(hash1, hashDifferentText, "Changing text must change hash");
  });
});
