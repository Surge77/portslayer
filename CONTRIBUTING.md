# Contributing to Portslayer

Thanks for contributing.

## Getting Started

1. Fork the repository.
2. Clone your fork locally.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feat/your-change
   ```

## Development Commands

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Contribution Guidelines

- Keep changes focused and atomic.
- Add or update tests for behavior changes.
- Keep CLI help text and README examples in sync with code.
- Follow existing TypeScript style and naming patterns.
- Use Conventional Commits when possible (`feat:`, `fix:`, `chore:`).

## Pull Requests

Please include:

- A short summary of what changed.
- Why the change is needed.
- Test evidence (command output or CI pass).
- Screenshots/snippets for CLI output changes when relevant.

## Reporting Bugs

Open a GitHub issue with:

- OS and Node version.
- Exact command you ran.
- Full output/error text.
- Steps to reproduce.
