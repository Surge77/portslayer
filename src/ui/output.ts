import { Chalk } from "chalk";
import ora from "ora";
import type { CliContext, PortProcessInfo } from "../types.js";

export function createStyler(useColor: boolean) {
  return new Chalk({ level: useColor ? 3 : 0 });
}

export function createSpinner(context: CliContext, text: string) {
  if (context.json || !context.interactive) {
    return null;
  }
  return ora({ text }).start();
}

function padRight(value: string, width: number): string {
  if (value.length >= width) {
    return value;
  }
  return value + " ".repeat(width - value.length);
}

export function renderProcessTable(processes: PortProcessInfo[]): string {
  if (processes.length === 0) {
    return "No listening ports found.";
  }

  const rows: string[][] = [
    ["PORT", "PID", "COMMAND", "ADDRESS"],
    ...processes.map((item) => [
      String(item.port),
      String(item.pid),
      item.command ?? "unknown",
      item.address
    ])
  ];

  const widths = rows[0].map((_, idx) =>
    Math.max(...rows.map((row) => row[idx].length))
  );

  return rows
    .map((row, rowIndex) =>
      row
        .map((cell, cellIndex) => padRight(cell, widths[cellIndex]))
        .join(rowIndex === 0 ? " | " : "   ")
    )
    .join("\n");
}

export function printJson(data: unknown): void {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}
