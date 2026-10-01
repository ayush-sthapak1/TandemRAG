import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { upload } from "../controllers/resumeController.js";

describe("Resume Parser Unit Tests", () => {
  test("accepts plain text file uploads", (t, done) => {
    const mockFile = {
      mimetype: "text/plain",
      originalname: "resume.txt"
    };

    upload.fileFilter({}, mockFile, (err, accepted) => {
      assert.strictEqual(err, null);
      assert.strictEqual(accepted, true);
      done();
    });
  });

  test("accepts pdf file uploads", (t, done) => {
    const mockFile = {
      mimetype: "application/pdf",
      originalname: "resume.pdf"
    };

    upload.fileFilter({}, mockFile, (err, accepted) => {
      assert.strictEqual(err, null);
      assert.strictEqual(accepted, true);
      done();
    });
  });

  test("rejects unsupported file extensions and MIME types", (t, done) => {
    const mockFile = {
      mimetype: "application/msword",
      originalname: "resume.docx"
    };

    upload.fileFilter({}, mockFile, (err, accepted) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.includes("Unsupported file type"));
      done();
    });
  });

  test("enforces maximum file size limit of 2 MB", () => {
    assert.strictEqual(upload.limits.fileSize, 2 * 1024 * 1024);
  });
});
