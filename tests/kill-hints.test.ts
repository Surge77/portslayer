import { describe, expect, it } from "vitest";
import { buildForceRetryHint } from "../src/utils/kill-hints.js";
import type { KillAttemptResult } from "../src/types.js";

describe("buildForceRetryHint", () => {
  it("returns force command when taskkill says /F is required", () => {
    const failed: KillAttemptResult[] = [
      {
        pid: 18180,
        success: false,
        message:
          "ERROR: The process with PID 18180 could not be terminated. This process can only be terminated forcefully (with /F option)."
      }
    ];

    expect(buildForceRetryHint(failed, 3000, false)).toBe("portslayer kill 3000 --force");
  });

  it("adds --all for multiple failed pids", () => {
    const failed: KillAttemptResult[] = [
      { pid: 1, success: false, message: "with /F option" },
      { pid: 2, success: false, message: "with /F option" }
    ];

    expect(buildForceRetryHint(failed, 3000, false)).toBe("portslayer kill 3000 --force --all");
  });

  it("returns undefined when already forced", () => {
    const failed: KillAttemptResult[] = [{ pid: 1, success: false, message: "with /F option" }];
    expect(buildForceRetryHint(failed, 3000, true)).toBeUndefined();
  });
});
