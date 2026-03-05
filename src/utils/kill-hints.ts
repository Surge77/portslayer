import type { KillAttemptResult } from "../types.js";

const FORCE_REQUIRED_PATTERNS = [
  "only be terminated forcefully",
  "with /f option",
  "requires /f",
  "access is denied"
];

function needsForceRetry(result: KillAttemptResult): boolean {
  const message = result.message.toLowerCase();
  return FORCE_REQUIRED_PATTERNS.some((pattern) => message.includes(pattern));
}

export function buildForceRetryHint(
  failedResults: KillAttemptResult[],
  port: number,
  alreadyForced: boolean
): string | undefined {
  if (alreadyForced || failedResults.length === 0) {
    return undefined;
  }

  if (!failedResults.some(needsForceRetry)) {
    return undefined;
  }

  const allFlag = failedResults.length > 1 ? " --all" : "";
  return `portslayer kill ${port} --force${allFlag}`;
}
