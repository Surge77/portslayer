# portslayer

Cross-platform CLI to inspect and kill processes by port on Windows, macOS, and Linux.

## Why portslayer?

- Works across all major desktop/server OSes.
- Interactive by default when run in a terminal.
- Script-friendly with flags and JSON output.
- Gives clear kill summaries and useful failure messages.

## Install

```bash
npm install -g portslayer
```

## Quick Usage

```bash
portslayer list
portslayer check 3000
portslayer kill 3000
```

## Commands

### `portslayer list`

Lists listening TCP ports and process ownership.

Flags:

- `--json` machine-readable output
- `--no-color` disable colors
- `--verbose` include extra details

### `portslayer check <port>`

Checks whether a specific port is in use.

Exit code behavior:

- `0` port is free
- `1` port is occupied
- `2` invalid user input (for example invalid port)

### `portslayer kill [port]`

Kills process(es) bound to the target port.

If `port` is omitted in interactive terminals, portslayer prompts for it.

Flags:

- `--port <number>` provide port as named option
- `--all` kill all PIDs listening on the port
- `--force` force termination (`taskkill /F`, `kill -9`)
- `--dry-run` show what would be killed
- `--yes` skip confirmation prompt
- `--json` machine-readable output

## Examples

```bash
# Interactive kill flow
portslayer kill

# Kill all processes on port 5173 without confirmation
portslayer kill 5173 --all --yes

# CI-friendly JSON mode
portslayer check 8080 --json

# Inspect before kill
portslayer kill 3000 --dry-run
```

## Local Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Run compiled CLI:

```bash
node dist/cli.js list
```

## Publish To npm

1. Update `package.json` metadata fields (`repository`, `bugs`, `homepage`, `author`).
2. Login to npm:
   ```bash
   npm login
   ```
3. Publish:
   ```bash
   npm publish --access public
   ```

Optional release automation with `np`:

```bash
npx np
```

## Troubleshooting

- Linux/macOS: if process metadata is missing, run with higher permissions.
- Linux: if `lsof` is unavailable, install it or ensure `ss` is present.
- Windows: if kill fails, retry with elevated terminal and `--force`.
