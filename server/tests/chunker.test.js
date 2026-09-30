import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseSections, chunkMarkdownFile } from "../services/chunker/chunker.js";

describe("Markdown Chunker Unit Tests", () => {
  const sampleMarkdown = `
# Introduction to DSA

Data structures organize data in memory efficiently. Arrays provide random access in O(1) time.

# Short Section A

This is a brief section about stacks and their LIFO characteristics.

# Short Section B

This is another brief adjacent section about queues and their FIFO characteristics.

# In-Depth Dynamic Programming Analysis

Dynamic programming solves complex problems by breaking them into overlapping subproblems. ` +
    "Let us explore how dynamic programming optimizes recursive state spaces through memoization and tabulation. ".repeat(30) +
`
It guarantees optimal solutions when optimal substructure holds.
`;

  test("parseSections correctly segments markdown by headings", () => {
    const sections = parseSections(sampleMarkdown);
    assert.strictEqual(sections.length, 4);
    assert.strictEqual(sections[0].heading, "Introduction to DSA");
    assert.strictEqual(sections[1].heading, "Short Section A");
    assert.strictEqual(sections[2].heading, "Short Section B");
    assert.strictEqual(sections[3].heading, "In-Depth Dynamic Programming Analysis");
  });

  test("merges adjacent short sections when under chunkSize", () => {
    const fileMeta = { sourceFile: "dsa/sample.md", topic: "DSA", difficulty: "medium" };
    // Using a large enough chunkSize so Short Section A and Short Section B merge
    const chunks = chunkMarkdownFile(sampleMarkdown, fileMeta, { chunkSize: 600, overlap: 50 });

    const mergedChunk = chunks.find((c) => c.headings.includes("Short Section A"));
    assert.ok(mergedChunk, "Expected to find a chunk containing Short Section A");
    // Should also include Short Section B because both are very short
    assert.ok(
      mergedChunk.headings.includes("Short Section B"),
      "Short Section A and B should be merged"
    );
    assert.ok(mergedChunk.primaryHeading);
  });

  test("splits long sections exceeding chunkSize", () => {
    const fileMeta = { sourceFile: "dsa/sample.md", topic: "DSA", difficulty: "hard" };
    // Small chunk size forces the repetitive DP section to split
    const chunks = chunkMarkdownFile(sampleMarkdown, fileMeta, { chunkSize: 100, overlap: 20 });

    const dpChunks = chunks.filter((c) =>
      c.headings.includes("In-Depth Dynamic Programming Analysis")
    );
    assert.ok(
      dpChunks.length > 1,
      `Expected long DP section to split into multiple chunks, got ${dpChunks.length}`
    );
    for (const chunk of dpChunks) {
      assert.strictEqual(chunk.primaryHeading, "In-Depth Dynamic Programming Analysis");
      assert.ok(chunk.text.length > 0);
    }
  });

  test("preserves file boundaries and populates all required metadata fields", () => {
    const fileMeta = { sourceFile: "os/threads.md", topic: "OS", difficulty: "medium" };
    const chunks = chunkMarkdownFile(sampleMarkdown, fileMeta, { chunkSize: 300, overlap: 50 });

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      assert.strictEqual(chunk.sourceFile, "os/threads.md");
      assert.strictEqual(chunk.topic, "OS");
      assert.strictEqual(chunk.difficulty, "medium");
      assert.strictEqual(chunk.chunkIndex, i);
      assert.strictEqual(chunk.chunkSize, 300);
      assert.ok(Array.isArray(chunk.headings));
      assert.ok(chunk.headings.length >= 1);
      assert.ok(typeof chunk.primaryHeading === "string");
      assert.ok(typeof chunk.text === "string" && chunk.text.length > 0);
    }
  });
});
