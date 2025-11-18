# ADR 0005: Bun Runtime and Tooling

- Status: Accepted
- Date: 2025-11-18

## Context

We need a fast JavaScript runtime and package manager with minimal overhead for local development, scripts, and CI. The project already uses Bun in scripts (`bun --bun vite`, `bun run`), lefthook hooks, and type definitions.

## Decision

Adopt Bun as the primary runtime and package manager for this project.

- Use Bun to run dev/build/typecheck/lint/format/test scripts
- Prefer `bun --bun` for tools that spawn Node-compatible CLIs (e.g., Vite, markdownlint, tsc)
- Keep Node types in devDependencies for tooling compatibility
- Document shell best practices and avoid chaining complex commands

## Consequences

- Faster installs and script execution, simpler local onboarding
- Single tool for scripts reduces environment drift
- Some Node-only tooling may still require compatibility flags or alternatives

## Alternatives Considered

- Node.js + npm — standard but slower installs and less integrated runner
- Node.js + pnpm — efficient installs, but still two-tool workflow vs Bun's integrated approach
- Deno — strong std tooling; ecosystem/library compatibility constraints for current stack

## References

- `package.json` scripts
- `.github/copilot-instructions.md`
- `lefthook.yml` hooks use Bun
