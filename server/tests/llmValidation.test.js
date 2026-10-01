import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  singleQuestionSchema,
  generatedQuestionsListSchema,
  profileExtractionSchema,
  evaluationRequestSchema
} from "../utils/validationSchemas.js";

describe("LLM Output Validation Unit Tests", () => {
  const validQuestion = {
    question: "How does JavaScript handle asynchronous operations via the Event Loop?",
    topic: "Web / MERN",
    difficulty: "medium",
    type: "technical",
    expectedAnswer: [
      "V8 call stack executes synchronous code",
      "libuv manages asynchronous I/O and thread pool",
      "Microtasks (Promises, process.nextTick) execute before next event loop tick",
      "Timers and I/O callbacks run in dedicated phases"
    ],
    followUps: [
      "What is the difference between setImmediate and setTimeout(0)?",
      "How does process.nextTick starvation occur?"
    ],
    citations: [
      {
        sourceFile: "web/node-event-loop.md",
        heading: "Event Loop Execution Phases"
      }
    ]
  };

  test("validates schema with valid question output", () => {
    const validated = singleQuestionSchema.parse(validQuestion);
    assert.strictEqual(validated.type, "technical");
    assert.strictEqual(validated.citations.length, 1);
  });

  test("rejects malformed questions missing required fields", () => {
    const missingTopic = { ...validQuestion };
    delete missingTopic.topic;
    assert.throws(() => singleQuestionSchema.parse(missingTopic), /Required|Topic is required/);

    const missingFollowUps = { ...validQuestion };
    delete missingFollowUps.followUps;
    assert.throws(() => singleQuestionSchema.parse(missingFollowUps));
  });

  test("rejects questions with incorrect field types", () => {
    const wrongType = { ...validQuestion, expectedAnswer: "not an array" };
    assert.throws(() => singleQuestionSchema.parse(wrongType), /Expected array/);

    const wrongCitations = { ...validQuestion, citations: "not an array" };
    assert.throws(() => singleQuestionSchema.parse(wrongCitations), /Expected array/);
  });

  test("rejects questions where expectedAnswer has < 3 points", () => {
    const tooFewAnswers = {
      ...validQuestion,
      expectedAnswer: ["Only one point", "Only two points"]
    };
    assert.throws(
      () => singleQuestionSchema.parse(tooFewAnswers),
      /Expected answer must contain at least 3 points/
    );
  });

  test("rejects questions where followUps is not exactly 2 items", () => {
    const oneFollowUp = {
      ...validQuestion,
      followUps: ["Single follow-up question"]
    };
    assert.throws(
      () => singleQuestionSchema.parse(oneFollowUp),
      /Follow-ups must contain exactly 2 questions/
    );

    const threeFollowUps = {
      ...validQuestion,
      followUps: ["Q1", "Q2", "Q3"]
    };
    assert.throws(
      () => singleQuestionSchema.parse(threeFollowUps),
      /Follow-ups must contain exactly 2 questions/
    );
  });

  test("rejects questions where citations array is empty", () => {
    const emptyCitations = {
      ...validQuestion,
      citations: []
    };
    assert.throws(
      () => singleQuestionSchema.parse(emptyCitations),
      /Every question must contain at least one citation/
    );
  });

  test("validates profile extraction schema", () => {
    const validProfile = {
      skills: ["Data Structures", "Dynamic Programming"],
      projects: ["TaskMaster"],
      technologies: ["React", "Express", "Node.js"]
    };
    const validated = profileExtractionSchema.parse(validProfile);
    assert.strictEqual(validated.skills.length, 2);
  });

  test("rejects evaluation request with > 5 citations", () => {
    const tooManyCitations = {
      question: "Test question?",
      answer: "My answer",
      citations: [
        { sourceFile: "a.md", heading: "H1" },
        { sourceFile: "b.md", heading: "H2" },
        { sourceFile: "c.md", heading: "H3" },
        { sourceFile: "d.md", heading: "H4" },
        { sourceFile: "e.md", heading: "H5" },
        { sourceFile: "f.md", heading: "H6" }
      ]
    };
    assert.throws(
      () => evaluationRequestSchema.parse(tooManyCitations),
      /Maximum 5 citations allowed/
    );
  });
});
