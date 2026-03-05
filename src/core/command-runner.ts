import { execa } from "execa";

export interface CommandRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CommandRunner {
  run(command: string, args?: string[]): Promise<CommandRunResult>;
}

export class ExecaCommandRunner implements CommandRunner {
  async run(command: string, args: string[] = []): Promise<CommandRunResult> {
    const result = await execa(command, args, {
      reject: false,
      windowsHide: true
    });

    return {
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      exitCode: result.exitCode ?? 0
    };
  }
}
