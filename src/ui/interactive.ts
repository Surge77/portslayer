import { checkbox, confirm, input } from "@inquirer/prompts";
import type { PortProcessInfo } from "../types.js";
import { parsePortInput } from "../utils/port.js";

export async function promptForPort(): Promise<number> {
  const value = await input({
    message: "Enter the port to target:",
    validate: (candidate) => {
      try {
        parsePortInput(candidate);
        return true;
      } catch (error) {
        return (error as Error).message;
      }
    }
  });

  return parsePortInput(value);
}

export async function chooseProcesses(processes: PortProcessInfo[]): Promise<number[]> {
  if (processes.length === 0) {
    return [];
  }

  const pidChoices = await checkbox({
    message: "Select the processes to kill:",
    required: true,
    choices: processes.map((process) => ({
      name: `${process.command ?? "unknown"}  pid:${process.pid}  ${process.address}:${process.port}`,
      value: process.pid
    }))
  });

  return [...new Set(pidChoices)];
}

export async function confirmKillAction(pids: number[], port: number): Promise<boolean> {
  const count = pids.length;
  return confirm({
    message: `Kill ${count} process${count > 1 ? "es" : ""} on port ${port}?`,
    default: false
  });
}
