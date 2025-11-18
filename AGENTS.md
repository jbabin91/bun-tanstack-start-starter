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

Use the integration-specific AGENTS.md for focused guidance:

- `@/docs/tanstack/query/AGENTS.md` — Data fetching, caching, queryOptions factories, invalidation, mutations, SSR hydration
- `@/docs/tanstack/router/AGENTS.md` — Routing (loaders, navigation, params/search), route trees, SSR behavior
- `@/docs/tanstack/start/AGENTS.md` — Server functions, selective SSR, middleware, auth, observability

Each AGENTS.md links to its overview and topic docs. Start with the relevant file based on your task; if unsure, open Router first, then follow cross-links to Query or Start.

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

## ESLint & Type Safety Rules

- **Never disable ESLint rules** (`eslint-disable`, `eslint-disable-next-line`) without explicit user confirmation. The configured rules exist for a reason.
- When lint errors occur, fix the underlying issue rather than suppressing warnings.
- If a rule seems incorrect, ask the user before disabling it—they may need to update the config.

### TypeScript Type Resolution Hierarchy

When solving type issues, follow this preference order (best to last resort):

1. **Infer**: Let TypeScript infer types naturally from context, return values, and usage.
2. **`satisfies`**: Use `value satisfies Type` to validate without widening the inferred type.
3. **`: Type`**: Explicit annotation `const value: Type = ...` when inference isn't sufficient.
4. **`as Type`**: Type assertion only when you have more context than TypeScript (avoid when possible).
5. **`as any`**: Never use except in extraordinary circumstances with user approval.

Always solve the actual type issue rather than using type assertions as workarounds.
