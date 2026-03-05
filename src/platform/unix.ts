import type { CommandRunner } from "../core/command-runner.js";
import { CliError } from "../errors.js";
import { parseLsofOutput, parseSsOutput } from "./parsers.js";
import type { KillAttemptResult, PortProcessInfo } from "../types.js";

export class UnixPortAdapter {
  constructor(private readonly runner: CommandRunner) {}

  async listListening(): Promise<PortProcessInfo[]> {
    const lsofResult = await this.tryLsof();
    if (lsofResult) {
      return lsofResult;
    }

    const ssResult = await this.trySs();
    if (ssResult) {
      return ssResult;
    }

    throw new CliError(
      "Unable to inspect listening ports. Ensure `lsof` or `ss` exists in your PATH."
    );
  }

  async killPid(pid: number, force: boolean): Promise<KillAttemptResult> {
    const args = force ? ["-9", String(pid)] : [String(pid)];
    const result = await this.runner.run("kill", args);
    return {
      pid,
      success: result.exitCode === 0,
      message: result.stderr || result.stdout || "kill completed."
    };
  }

  private async tryLsof(): Promise<PortProcessInfo[] | null> {
    try {
      const result = await this.runner.run("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]);
      if (result.exitCode !== 0 && !result.stdout.trim()) {
        return null;
      }
      return parseLsofOutput(result.stdout, "unix");
    } catch {
      return null;
    }
  }

  private async trySs(): Promise<PortProcessInfo[] | null> {
    try {
      const result = await this.runner.run("ss", ["-ltnp"]);
      if (result.exitCode !== 0 && !result.stdout.trim()) {
        return null;
      }
      return parseSsOutput(result.stdout);
    } catch {
      return null;
    }
  }
}
