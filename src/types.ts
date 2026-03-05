export type PlatformKind = "windows" | "unix";

export interface PortProcessInfo {
  pid: number;
  port: number;
  protocol: "tcp";
  address: string;
  command?: string;
  state?: "LISTEN";
  platform: PlatformKind;
}

export interface KillAttemptResult {
  pid: number;
  success: boolean;
  message: string;
}

export interface CliContext {
  json: boolean;
  color: boolean;
  verbose: boolean;
  interactive: boolean;
}
