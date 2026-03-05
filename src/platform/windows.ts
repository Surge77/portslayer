import type { CommandRunner } from "../core/command-runner.js";
import { CliError } from "../errors.js";
import { parseWindowsNetstat } from "./parsers.js";
import type { KillAttemptResult, PortProcessInfo } from "../types.js";

function parseTasklistName(stdout: string): string | undefined {
  const line = stdout
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("\""));

  if (!line) {
    return undefined;
  }

  const match = line.match(/^"([^"]+)","(\d+)"/);
  return match?.[1];
}

export class WindowsPortAdapter {
  constructor(private readonly runner: CommandRunner) {}

  async listListening(): Promise<PortProcessInfo[]> {
    const netstatResult = await this.runner.run("netstat", ["-ano", "-p", "tcp"]);
    if (netstatResult.exitCode !== 0) {
      throw new CliError(
        `Failed to inspect ports on Windows: ${netstatResult.stderr || netstatResult.stdout}`
      );
    }

    const processes = parseWindowsNetstat(netstatResult.stdout);
    const pids = [...new Set(processes.map((item) => item.pid))];
    const processNameMap = await this.getProcessNames(pids);

    return processes.map((entry) => ({
      ...entry,
      command: processNameMap.get(entry.pid) ?? entry.command
    }));
  }

  async killPid(pid: number, force: boolean): Promise<KillAttemptResult> {
    const args = ["/PID", String(pid), "/T"];
    if (force) {
      args.push("/F");
    }

    const result = await this.runner.run("taskkill", args);
    return {
      pid,
      success: result.exitCode === 0,
      message: result.stderr || result.stdout || "taskkill completed."
    };
  }

  private async getProcessNames(pids: number[]): Promise<Map<number, string>> {
    const names = new Map<number, string>();

    for (const pid of pids) {
      const result = await this.runner.run("tasklist", [
        "/FI",
        `PID eq ${pid}`,
        "/FO",
        "CSV",
        "/NH"
      ]);

      if (result.exitCode !== 0) {
        continue;
      }

      const name = parseTasklistName(result.stdout);
      if (name) {
        names.set(pid, name);
      }
    }

    return names;
  }
}
