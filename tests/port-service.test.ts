import { describe, expect, it, vi } from "vitest";
import { NativePortService } from "../src/services/port-service.js";
import type { KillAttemptResult, PortProcessInfo } from "../src/types.js";

describe("NativePortService", () => {
  it("deduplicates and sorts listening entries", async () => {
    const listListening = vi.fn<[], Promise<PortProcessInfo[]>>().mockResolvedValue([
      { pid: 20, port: 4000, protocol: "tcp", address: "*", platform: "unix", state: "LISTEN" },
      { pid: 11, port: 3000, protocol: "tcp", address: "*", platform: "unix", state: "LISTEN" },
      { pid: 11, port: 3000, protocol: "tcp", address: "*", platform: "unix", state: "LISTEN" }
    ]);

    const killPid = vi.fn<[number, boolean], Promise<KillAttemptResult>>().mockResolvedValue({
      pid: 11,
      success: true,
      message: "ok"
    });

    const service = new NativePortService({ listListening, killPid });
    const results = await service.listListening();

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ port: 3000, pid: 11 });
    expect(results[1]).toMatchObject({ port: 4000, pid: 20 });
  });

  it("filters entries by target port", async () => {
    const listListening = vi.fn<[], Promise<PortProcessInfo[]>>().mockResolvedValue([
      { pid: 11, port: 3000, protocol: "tcp", address: "*", platform: "unix", state: "LISTEN" },
      { pid: 22, port: 5000, protocol: "tcp", address: "*", platform: "unix", state: "LISTEN" }
    ]);
    const killPid = vi.fn<[number, boolean], Promise<KillAttemptResult>>();

    const service = new NativePortService({ listListening, killPid });
    const filtered = await service.findByPort(5000);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].pid).toBe(22);
  });
});
