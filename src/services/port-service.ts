import type { CommandRunner } from "../core/command-runner.js";
import { CliError } from "../errors.js";
import { UnixPortAdapter } from "../platform/unix.js";
import { WindowsPortAdapter } from "../platform/windows.js";
import type { KillAttemptResult, PortProcessInfo } from "../types.js";

interface PortAdapter {
  listListening(): Promise<PortProcessInfo[]>;
  killPid(pid: number, force: boolean): Promise<KillAttemptResult>;
}

function dedupeAndSort(items: PortProcessInfo[]): PortProcessInfo[] {
  const deduped = new Map<string, PortProcessInfo>();
  for (const item of items) {
    const key = `${item.port}-${item.pid}-${item.address}`;
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  return [...deduped.values()].sort((a, b) => {
    if (a.port !== b.port) {
      return a.port - b.port;
    }
    return a.pid - b.pid;
  });
}

export class NativePortService {
  constructor(private readonly adapter: PortAdapter) {}

  static create(runner: CommandRunner, platform: NodeJS.Platform = process.platform): NativePortService {
    if (platform === "win32") {
      return new NativePortService(new WindowsPortAdapter(runner));
    }
    if (platform === "darwin" || platform === "linux") {
      return new NativePortService(new UnixPortAdapter(runner));
    }
    throw new CliError(`Unsupported platform: ${platform}`);
  }

  async listListening(): Promise<PortProcessInfo[]> {
    const processes = await this.adapter.listListening();
    return dedupeAndSort(processes);
  }

  async findByPort(port: number): Promise<PortProcessInfo[]> {
    const processes = await this.listListening();
    return processes.filter((item) => item.port === port);
  }

  killPid(pid: number, force: boolean): Promise<KillAttemptResult> {
    return this.adapter.killPid(pid, force);
  }
}

export type { PortAdapter };
