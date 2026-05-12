import assert from "node:assert/strict";
import test from "node:test";

import { rewriteTranscript } from "./rewriter";

test("raw transcript mode skips rewrite", async () => {
  const result = await rewriteTranscript({
    mode: "raw-transcript",
    tonePreference: "clear",
    transcript: "  ship   it  ",
  });

  assert.equal(result.didRewrite, false);
  assert.equal(result.engine, "none");
  assert.equal(result.skippedReason, "raw-transcript");
  assert.equal(result.text, "ship it");
});

test("filler-only transcript skips rewrite", async () => {
  const result = await rewriteTranscript({
    mode: "clean-text",
    tonePreference: "clear",
    transcript: "um uh hmm",
  });

  assert.equal(result.didRewrite, false);
  assert.equal(result.engine, "none");
  assert.equal(result.skippedReason, "filler-only-transcript");
  assert.equal(result.text, "");
});

test("very short transcript skips remote rewrite", async () => {
  const result = await rewriteTranscript({
    mode: "polished-message",
    tonePreference: "clear",
    transcript: "done",
  });

  assert.equal(result.didRewrite, false);
  assert.equal(result.engine, "none");
  assert.equal(result.skippedReason, "short-transcript");
  assert.equal(result.text, "done");
});
