import { CliError } from "../errors.js";
import type { PortProcessInfo } from "../types.js";

export interface KillResolutionOptions {
  interactive: boolean;
  all: boolean;
  yes: boolean;
}

export interface KillSelectionInteractor {
  selectPids(processes: PortProcessInfo[]): Promise<number[]>;
}

function uniquePids(processes: PortProcessInfo[]): number[] {
  return [...new Set(processes.map((item) => item.pid))];
}

export async function resolveKillTargets(
  processes: PortProcessInfo[],
  options: KillResolutionOptions,
  interactor?: KillSelectionInteractor
): Promise<number[]> {
  if (processes.length === 0) {
    return [];
  }

  const dedupedPids = uniquePids(processes);
  if (dedupedPids.length === 1) {
    return dedupedPids;
  }

  if (options.all || options.yes) {
    return dedupedPids;
  }

  if (!options.interactive || !interactor) {
    throw new CliError(
      "Multiple processes detected for this port. Use --all (or --yes) in non-interactive mode."
    );
  }

  return interactor.selectPids(processes);
}
