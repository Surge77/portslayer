export class CliError extends Error {
  readonly exitCode: number;
  readonly code: string;

  constructor(message: string, options?: { exitCode?: number; code?: string }) {
    super(message);
    this.name = "CliError";
    this.exitCode = options?.exitCode ?? 1;
    this.code = options?.code ?? "CLI_ERROR";
  }
}
