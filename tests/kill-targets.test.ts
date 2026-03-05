import { describe, expect, it, vi } from "vitest";
import { CliError } from "../src/errors.js";
import { resolveKillTargets } from "../src/services/kill-targets.js";
import type { PortProcessInfo } from "../src/types.js";

const sampleProcesses: PortProcessInfo[] = [
  { pid: 111, port: 3000, protocol: "tcp", address: "0.0.0.0", platform: "windows", state: "LISTEN" },
  { pid: 222, port: 3000, protocol: "tcp", address: "127.0.0.1", platform: "windows", state: "LISTEN" }
];

describe("resolveKillTargets", () => {
  it("returns all pids when --all is true", async () => {
    const result = await resolveKillTargets(sampleProcesses, {
      interactive: false,
      all: true,
      yes: false
    });
    expect(result).toEqual([111, 222]);
  });

  it("throws in non-interactive mode without explicit selection", async () => {
    await expect(
      resolveKillTargets(sampleProcesses, {
        interactive: false,
        all: false,
        yes: false
      })
    ).rejects.toBeInstanceOf(CliError);
  });

  it("uses interactor selection in interactive mode", async () => {
    const selectPids = vi.fn().mockResolvedValue([222]);
    const result = await resolveKillTargets(
      sampleProcesses,
      { interactive: true, all: false, yes: false },
      { selectPids }
    );
    expect(selectPids).toHaveBeenCalledOnce();
    expect(result).toEqual([222]);
  });
});
