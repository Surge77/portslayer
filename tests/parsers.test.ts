import { describe, expect, it } from "vitest";
import { parseLsofOutput, parseSsOutput, parseWindowsNetstat } from "../src/platform/parsers.js";

describe("parseWindowsNetstat", () => {
  it("extracts listening tcp entries", () => {
    const output = `
  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       1234
  TCP    [::]:3000              [::]:0                 LISTENING       1234
  TCP    127.0.0.1:9229         0.0.0.0:0              LISTENING       5678
`;

    const parsed = parseWindowsNetstat(output);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toMatchObject({ pid: 1234, port: 3000, platform: "windows" });
    expect(parsed[2]).toMatchObject({ pid: 5678, port: 9229 });
  });
});

describe("parseLsofOutput", () => {
  it("extracts listen entries from lsof output", () => {
    const output = `
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    42211 user   21u  IPv6 0x000      0t0  TCP *:5173 (LISTEN)
python3 50000 user    3u  IPv4 0x001      0t0  TCP 127.0.0.1:8000 (LISTEN)
`;

    const parsed = parseLsofOutput(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({ command: "node", pid: 42211, port: 5173 });
    expect(parsed[1]).toMatchObject({ command: "python3", port: 8000 });
  });
});

describe("parseSsOutput", () => {
  it("extracts listen entries and process names from ss output", () => {
    const output = `
State      Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN     0      4096   0.0.0.0:3000      0.0.0.0:* users:(("node",pid=1001,fd=23))
LISTEN     0      4096   [::]:5432         [::]:*    users:(("postgres",pid=2002,fd=6))
`;

    const parsed = parseSsOutput(output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({ pid: 1001, command: "node", port: 3000 });
    expect(parsed[1]).toMatchObject({ pid: 2002, command: "postgres", port: 5432 });
  });
});
