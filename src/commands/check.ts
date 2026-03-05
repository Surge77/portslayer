import { CliError } from "../errors.js";
import type { NativePortService } from "../services/port-service.js";
import type { CliContext } from "../types.js";
import { createStyler, printJson, renderProcessTable } from "../ui/output.js";
import { parsePortInput } from "../utils/port.js";

export async function runCheckCommand(
  service: NativePortService,
  context: CliContext,
  rawPort: string
): Promise<void> {
  let port: number;
  try {
    port = parsePortInput(rawPort);
  } catch (error) {
    throw new CliError((error as Error).message, { code: "INVALID_PORT", exitCode: 2 });
  }

  const styles = createStyler(context.color);
  const processes = await service.findByPort(port);
  const occupied = processes.length > 0;

  if (context.json) {
    printJson({
      success: true,
      port,
      occupied,
      processes
    });
  } else if (occupied) {
    process.stdout.write(`${styles.yellowBright(`Port ${port} is occupied.`)}\n`);
    process.stdout.write(`${renderProcessTable(processes)}\n`);
  } else {
    process.stdout.write(`${styles.greenBright(`Port ${port} is free.`)}\n`);
  }

  process.exitCode = occupied ? 1 : 0;
}
