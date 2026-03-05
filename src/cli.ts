import { Command } from "commander";
import { runCheckCommand } from "./commands/check.js";
import { runKillCommand } from "./commands/kill.js";
import { runListCommand } from "./commands/list.js";
import { ExecaCommandRunner } from "./core/command-runner.js";
import { CliError } from "./errors.js";
import { NativePortService } from "./services/port-service.js";
import type { CliContext } from "./types.js";
import { createStyler } from "./ui/output.js";

interface GlobalOptions {
  json?: boolean;
  color?: boolean;
  verbose?: boolean;
}

function createContext(command: Command): CliContext {
  const opts = command.optsWithGlobals<GlobalOptions>();
  return {
    json: Boolean(opts.json),
    color: opts.color !== false,
    verbose: Boolean(opts.verbose),
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY && !opts.json)
  };
}

function withContext(
  fn: (context: CliContext, service: NativePortService, command: Command) => Promise<void>
) {
  return async (...args: unknown[]) => {
    const command = args.at(-1) as Command;
    const context = createContext(command);
    const runner = new ExecaCommandRunner();
    const service = NativePortService.create(runner);
    await fn(context, service, command);
  };
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("portslayer")
    .description("Cross-platform CLI to inspect and kill processes by port.")
    .version("0.1.0")
    .showHelpAfterError()
    .option("--json", "Print machine-readable JSON output")
    .option("--no-color", "Disable color output")
    .option("--verbose", "Show verbose output");

  program
    .command("list")
    .description("List listening TCP ports and owning processes")
    .action(
      withContext(async (context, service) => {
        await runListCommand(service, context);
      })
    );

  program
    .command("check")
    .description("Check whether a port is occupied")
    .argument("<port>", "Port number to check")
    .action(
      withContext(async (context, service, command) => {
        const port = command.args[0] as string;
        await runCheckCommand(service, context, port);
      })
    );

  program
    .command("kill")
    .description("Kill process(es) listening on a given port")
    .argument("[port]", "Port number to target")
    .option("--port <number>", "Port number to target")
    .option("--all", "Kill all process IDs on the port")
    .option("--force", "Use forceful kill")
    .option("--dry-run", "Show targets but do not kill")
    .option("--yes", "Skip confirmation prompts")
    .action(
      withContext(async (context, service, command) => {
        const positionalPort = command.args[0] as string | undefined;
        const options = command.opts<{
          port?: string;
          all?: boolean;
          force?: boolean;
          dryRun?: boolean;
          yes?: boolean;
        }>();

        await runKillCommand(service, context, positionalPort, options);
      })
    );

  await program.parseAsync(process.argv);
}

void main().catch((error: unknown) => {
  const style = createStyler(true);
  if (error instanceof CliError) {
    process.stderr.write(`${style.red(`Error: ${error.message}`)}\n`);
    process.exit(error.exitCode);
  }

  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${style.red(`Unexpected error: ${message}`)}\n`);
  process.exit(1);
});
