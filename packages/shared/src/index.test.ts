import assert from "node:assert/strict";
import test from "node:test";

import { defaultSettings, isOutputMode, outputModes } from "./index";

test("default settings use a supported output mode", () => {
  assert.equal(isOutputMode(defaultSettings.defaultMode), true);
});

test("supported mode list includes MVP modes", () => {
  assert.deepEqual(outputModes, [
    "raw-transcript",
    "clean-text",
    "polished-message",
    "coding-prompt",
  ]);
});
