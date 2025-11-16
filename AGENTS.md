<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## TanStack Documentation

Always open `@/docs/tanstack/router/AGENTS.md` when working on:

- Routing features (dynamic routes, loaders, navigation, search params)
- Route structure, configuration, and patterns
- Data loading lifecycle, caching, and preloading
- Authentication/authorization in routes
- SSR behavior or server-side routing concerns

See the nested `AGENTS.md` files in `docs/tanstack/` for each integration's specific patterns and guidance.

## Workflow

- Dev server: `bun --bun vite dev --port 3000`.
- Build: `bun --bun vite build`; preview with `bun --bun vite preview`.
- Typecheck: `bun --bun tsc --noEmit`.
- Full lint: `bun --bun eslint . --max-warnings 0 --cache --cache-location ./node_modules/.cache/eslint/.eslintcache`.
- Auto-fix lint: same command with `--fix`.
- Markdown lint: `bun --bun markdownlint-cli2 [--fix]`.
- Format: `bun --bun prettier -uwl --cache .`; verify with `-uc`.
- Tests: `bun --bun vitest run`; watch via `bun --bun vitest watch`.
- Single test: `bun --bun vitest run src/foo.test.ts -t "case"`.
- Install lefthook via `bun run prepare` if hooks drift.

## Style

- Follow Prettier (semicolons on, single quotes) and Tailwind plugin ordering.
- Prefer TypeScript `type` aliases; strict mode blocks unused locals/params.
- Import sorting via `simple-import-sort`; no duplicate or parent-relative imports (use `@/`).
- Keep inline type-only imports/exports; reserve `any` for exceptional cases.
- Enforce strict equality, kebab-case filenames (unicorn), and reserved-first JSX props.
- React: hooks linted but deps optional; label controls via `<Label>`; no prop-types.
- Tailwind: prefer shorthand classes; avoid deprecated/duplicate combos per `better-tailwindcss`.
- Console logging is warn-only except env/db/tests; favor structured errors (`Error`).
- Async handlers must resolve promises (`@typescript-eslint/no-misused-promises`).
- Planning/spec work must also read `openspec/AGENTS.md`; observe nested instructions:
  - `docs/`: follow `docs/AGENTS.md` for documentation style.
