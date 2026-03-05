<p align="center">
  <img src="https://raw.githubusercontent.com/Surge77/portslayer/main/assets/portslayer-logo.svg" alt="Portslayer logo" width="720" />
</p>

<p align="center">
  <strong>Cross-platform CLI to inspect and kill processes by port</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/portslayer-cli"><img alt="npm version" src="https://img.shields.io/npm/v/portslayer-cli?color=16a34a&label=npm"></a>
  <a href="https://www.npmjs.com/package/portslayer-cli"><img alt="downloads" src="https://img.shields.io/npm/dm/portslayer-cli?color=0ea5e9"></a>
  <img alt="platforms" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-64748b">
</p>

# Portslayer

Cross-platform CLI to inspect and kill processes by port on Windows, macOS, and Linux.

## ⚡ Why Portslayer?

- Works across all major desktop/server OSes.
- Interactive by default when run in a terminal.
- Script-friendly with flags and JSON output.
- Gives clear kill summaries and useful failure messages.

## 📦 Install

```bash
npm install -g portslayer-cli
```

## 🚀 Quick Usage

```bash
portslayer list
portslayer check 3000
portslayer kill 3000
```

## 🧰 Commands

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

## 🧪 Examples

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

## 🛠️ Local Development

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

## 📤 Publish to npm

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

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening PRs.

## 🔐 Security

Please read [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## 🆘 Troubleshooting

- Linux/macOS: if process metadata is missing, run with higher permissions.
- Linux: if `lsof` is unavailable, install it or ensure `ss` is present.
- Windows: if kill fails, retry with elevated terminal and `--force`.
