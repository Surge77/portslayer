import { CliError } from "../errors.js";
import { resolveKillTargets } from "../services/kill-targets.js";
import type { NativePortService } from "../services/port-service.js";
import type { CliContext, KillAttemptResult, PortProcessInfo } from "../types.js";
import { chooseProcesses, confirmKillAction, promptForPort } from "../ui/interactive.js";
import { createSpinner, createStyler, printJson, renderProcessTable } from "../ui/output.js";
import { parsePortInput } from "../utils/port.js";

interface KillCommandOptions {
  port?: string;
  all?: boolean;
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
}

function ensurePort(rawPort: string | undefined, context: CliContext): Promise<number> {
  if (rawPort !== undefined) {
    try {
      return Promise.resolve(parsePortInput(rawPort));
    } catch (error) {
      throw new CliError((error as Error).message, { code: "INVALID_PORT", exitCode: 2 });
    }
  }

  if (!context.interactive) {
    throw new CliError("Missing port. Pass it as argument or --port <number>.", {
      code: "MISSING_PORT",
      exitCode: 2
    });
  }

  return promptForPort();
}

async function killSelectedPids(
  service: NativePortService,
  pids: number[],
  force: boolean
): Promise<KillAttemptResult[]> {
  const attempts: KillAttemptResult[] = [];
  for (const pid of pids) {
    attempts.push(await service.killPid(pid, force));
  }
  return attempts;
}

function printDryRun(context: CliContext, port: number, targets: PortProcessInfo[]) {
  if (context.json) {
    printJson({
      success: true,
      dryRun: true,
      port,
      targets
    });
    return;
  }

  const styles = createStyler(context.color);
  process.stdout.write(`${styles.cyanBright(`Dry run for port ${port}`)}\n`);
  process.stdout.write(`${renderProcessTable(targets)}\n`);
}

export async function runKillCommand(
  service: NativePortService,
  context: CliContext,
  positionalPort: string | undefined,
  options: KillCommandOptions
): Promise<void> {
  const styles = createStyler(context.color);
  const port = await ensurePort(options.port ?? positionalPort, context);

  const scanSpinner = createSpinner(context, `Checking port ${port}...`);
  let processes: PortProcessInfo[];
  try {
    processes = await service.findByPort(port);
  } finally {
    scanSpinner?.stop();
  }

  if (processes.length === 0) {
    if (context.json) {
      printJson({
        success: false,
        port,
        message: "No listening process found for this port."
      });
    } else {
      process.stdout.write(styles.yellow(`No listening process found on port ${port}.\n`));
    }
    process.exitCode = 1;
    return;
  }

  const selectedPids = await resolveKillTargets(
    processes,
    {
      interactive: context.interactive,
      all: Boolean(options.all),
      yes: Boolean(options.yes)
    },
    context.interactive
      ? {
          selectPids: chooseProcesses
        }
      : undefined
  );

  const selectedProcesses = processes.filter((item) => selectedPids.includes(item.pid));
  if (selectedProcesses.length === 0) {
    throw new CliError("No processes selected.", { code: "NO_SELECTION" });
  }

  if (options.dryRun) {
    printDryRun(context, port, selectedProcesses);
    return;
  }

  if (context.interactive && !options.yes) {
    const approved = await confirmKillAction(selectedPids, port);
    if (!approved) {
      if (context.json) {
        printJson({
          success: true,
          aborted: true,
          port,
          selectedPids
        });
      } else {
        process.stdout.write(styles.yellow("Operation cancelled.\n"));
      }
      return;
    }
  }

  const killSpinner = createSpinner(context, "Terminating processes...");
  let results: KillAttemptResult[];
  try {
    results = await killSelectedPids(service, selectedPids, Boolean(options.force));
  } finally {
    killSpinner?.stop();
  }

  const succeeded = results.filter((result) => result.success);
  const failed = results.filter((result) => !result.success);

  if (context.json) {
    printJson({
      success: failed.length === 0,
      port,
      attempted: results.length,
      killed: succeeded,
      failed
    });
  } else {
    process.stdout.write(`${styles.cyanBright(`Port ${port} termination summary`)}\n`);
    process.stdout.write(
      `${styles.green(`Killed: ${succeeded.length}`)} ${styles.red(`Failed: ${failed.length}`)}\n`
    );
    if (context.verbose || failed.length > 0) {
      for (const result of results) {
        const status = result.success ? styles.green("OK") : styles.red("FAIL");
        process.stdout.write(`${status} pid:${result.pid} ${result.message}\n`);
      }
    }
  }

  process.exitCode = failed.length === 0 ? 0 : 1;
}
