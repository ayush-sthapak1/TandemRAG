import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateQuestionCitations } from "../services/llm/questionGenerator.js";

describe("Citation Validation Unit Tests", () => {
  const retrievedChunks = [
    {
      sourceFile: "web/jwt-auth.md",
      primaryHeading: "JSON Web Token (JWT) Anatomy and Cryptographic Verification",
      headings: [
        "JSON Web Token (JWT) Anatomy and Cryptographic Verification",
        "Stateless Authentication vs Stateful Sessions",
        "Access Token, Refresh Token Rotation, and Storage Security"
      ],
      topic: "Web / MERN",
      text: "JWT content..."
    },
    {
      sourceFile: "dsa/arrays.md",
      primaryHeading: "Array Data Structure Fundamentals",
      headings: [
        "Array Data Structure Fundamentals",
        "Two-Pointer and Sliding Window Techniques"
      ],
      topic: "DSA",
      text: "Array content..."
    }
  ];

  test("accepts valid citation matching primaryHeading", () => {
    const question = {
      citations: [
        {
          sourceFile: "web/jwt-auth.md",
          heading: "JSON Web Token (JWT) Anatomy and Cryptographic Verification"
        }
      ]
    };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, true);
  });

  test("accepts valid citation matching secondary heading in headings[]", () => {
    // Crucial requirement: Must NOT validate citations against only primaryHeading
    const question = {
      citations: [
        {
          sourceFile: "web/jwt-auth.md",
          heading: "Access Token, Refresh Token Rotation, and Storage Security"
        }
      ]
    };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, true);
  });

  test("rejects citation with wrong source file", () => {
    const question = {
      citations: [
        {
          sourceFile: "web/wrong-file.md",
          heading: "Access Token, Refresh Token Rotation, and Storage Security"
        }
      ]
    };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.reason.includes("not found in retrieved chunks"));
  });

  test("rejects citation with invented/wrong heading", () => {
    const question = {
      citations: [
        {
          sourceFile: "web/jwt-auth.md",
          heading: "Non-Existent Invented Heading"
        }
      ]
    };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.reason.includes("not found in retrieved chunks"));
  });

  test("rejects question with empty citations array", () => {
    const question = { citations: [] };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.reason, "Question has no citations.");
  });

  test("rejects citation absent from retrieved set completely", () => {
    const question = {
      citations: [
        {
          sourceFile: "dbms/acid.md",
          heading: "ACID Properties Overview"
        }
      ]
    };
    const result = validateQuestionCitations(question, retrievedChunks);
    assert.strictEqual(result.isValid, false);
  });
});
