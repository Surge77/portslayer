import type { CliContext } from "../types.js";
import { createSpinner, createStyler, printJson, renderProcessTable } from "../ui/output.js";
import type { NativePortService } from "../services/port-service.js";

export async function runListCommand(service: NativePortService, context: CliContext): Promise<void> {
  const spinner = createSpinner(context, "Scanning listening ports...");
  const styles = createStyler(context.color);

  let processes: Awaited<ReturnType<NativePortService["listListening"]>>;
  try {
    processes = await service.listListening();
  } finally {
    spinner?.stop();
  }

  if (context.json) {
    printJson({
      success: true,
      count: processes.length,
      data: processes
    });
    return;
  }

  process.stdout.write(`${styles.cyanBright("Listening Ports")}\n`);
  process.stdout.write(`${renderProcessTable(processes)}\n`);
}
