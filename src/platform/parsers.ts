import type { PlatformKind, PortProcessInfo } from "../types.js";

function parsePortAndAddress(endpoint: string): { port: number; address: string } | null {
  const match = endpoint.match(/:(\d+)$/);
  if (!match) {
    return null;
  }

  const port = Number(match[1]);
  if (!Number.isFinite(port)) {
    return null;
  }

  const address = endpoint.slice(0, endpoint.length - match[0].length);
  return { port, address: address || "*" };
}

function normalizeEntry(
  input: Omit<PortProcessInfo, "protocol" | "state"> & Partial<Pick<PortProcessInfo, "state">>
): PortProcessInfo {
  return {
    ...input,
    protocol: "tcp",
    state: "LISTEN"
  };
}

function dedupe(entries: PortProcessInfo[]): PortProcessInfo[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.pid}-${entry.port}-${entry.address}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function parseWindowsNetstat(output: string): PortProcessInfo[] {
  const lines = output.split(/\r?\n/);
  const processes: PortProcessInfo[] = [];

  for (const line of lines) {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 5) {
      continue;
    }

    if (tokens[0].toUpperCase() !== "TCP" || tokens[3].toUpperCase() !== "LISTENING") {
      continue;
    }

    const parsedEndpoint = parsePortAndAddress(tokens[1]);
    const pid = Number(tokens[4]);
    if (!parsedEndpoint || !Number.isFinite(pid)) {
      continue;
    }

    processes.push(
      normalizeEntry({
        pid,
        port: parsedEndpoint.port,
        address: parsedEndpoint.address,
        platform: "windows"
      })
    );
  }

  return dedupe(processes);
}

export function parseLsofOutput(output: string, platform: PlatformKind = "unix"): PortProcessInfo[] {
  const lines = output.split(/\r?\n/).filter(Boolean);
  const processes: PortProcessInfo[] = [];

  for (const line of lines) {
    if (line.startsWith("COMMAND")) {
      continue;
    }

    if (!line.includes("(LISTEN)")) {
      continue;
    }

    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 8) {
      continue;
    }

    const pid = Number(tokens[1]);
    const endpointToken = tokens[tokens.length - 2];
    const parsedEndpoint = parsePortAndAddress(endpointToken);
    if (!Number.isFinite(pid) || !parsedEndpoint) {
      continue;
    }

    processes.push(
      normalizeEntry({
        pid,
        command: tokens[0],
        port: parsedEndpoint.port,
        address: parsedEndpoint.address,
        platform
      })
    );
  }

  return dedupe(processes);
}

export function parseSsOutput(output: string): PortProcessInfo[] {
  const lines = output.split(/\r?\n/).filter(Boolean);
  const processes: PortProcessInfo[] = [];

  for (const line of lines) {
    const normalizedLine = line.trim();
    if (!normalizedLine.startsWith("LISTEN")) {
      continue;
    }

    const parts = normalizedLine.split(/\s+/);
    if (parts.length < 5) {
      continue;
    }

    const localEndpoint = parts[3];
    const parsedEndpoint = parsePortAndAddress(localEndpoint);
    if (!parsedEndpoint) {
      continue;
    }

    const pidsAndNames = Array.from(
      normalizedLine.matchAll(/"([^"]+)",pid=(\d+)/g),
      (match) => ({
        command: match[1],
        pid: Number(match[2])
      })
    );

    if (pidsAndNames.length === 0) {
      const fallbackPidMatches = Array.from(normalizedLine.matchAll(/pid=(\d+)/g), (match) =>
        Number(match[1])
      );
      for (const pid of fallbackPidMatches) {
        if (!Number.isFinite(pid)) {
          continue;
        }
        processes.push(
          normalizeEntry({
            pid,
            port: parsedEndpoint.port,
            address: parsedEndpoint.address,
            platform: "unix"
          })
        );
      }
      continue;
    }

    for (const item of pidsAndNames) {
      if (!Number.isFinite(item.pid)) {
        continue;
      }
      processes.push(
        normalizeEntry({
          pid: item.pid,
          command: item.command,
          port: parsedEndpoint.port,
          address: parsedEndpoint.address,
          platform: "unix"
        })
      );
    }
  }

  return dedupe(processes);
}
