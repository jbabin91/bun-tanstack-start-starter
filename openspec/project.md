# Project Context

## Purpose

Starter kit for TanStack Start apps combining file-based TanStack Router, TanStack Query, SSR demos, and shadcn/ui inspired components to accelerate building modern React applications with Bun.

## Tech Stack

- Bun runtime with Vite bundler + React 19.
- TypeScript strict mode, TanStack Router/Start, TanStack Query, Tailwind CSS v4.
- Vitest + Testing Library for unit/component tests.

## Project Conventions

### Code Style

- Prettier (semicolons, single quotes) and Tailwind plugin ordering.
- ESLint enforces kebab-case filenames, `@/` absolute imports, inline type-only imports, strict equality, `type` aliases, reserved-first JSX props, and limited console usage.
- Tailwind classes linted via `better-tailwindcss`; prefer shorthand utilities and avoid duplicates.

### Architecture Patterns

- File-based routing in `src/routes` with generated `routeTree.gen.ts`.
- Route loaders + TanStack Query for data fetching; shared providers under `src/integrations`.
- UI primitives co-located under `src/components/ui`; prefer composition and headless patterns.

### Testing Strategy

- `bun --bun vitest run` for suites, `bun --bun vitest run path.test.ts -t "case"` for targeted cases.
- Use Testing Library for user-facing interactions; maintain coverage for route loaders and UI state.

### Git Workflow

- Feature branches, descriptive commits; lefthook manages formatting/lint before push.
- Run typecheck, lint, tests before PR when feasible; proposals required for feature work via OpenSpec.

## Domain Context

Demonstrates TanStack ecosystem patterns (Router, Query, Start) plus SSR modes, so changes should preserve SSR/SPA parity and devtools integration.

## Important Constraints

- No breaking changes without OpenSpec proposal approval.
- Avoid new dependencies unless justified; prefer TanStack-first solutions.
- Console logs limited to warn/error; async handlers must fulfill promises.

## External Dependencies

- TanStack Router/Query packages, Base UI components, lucide-react icons, Tailwind CSS toolkit, Testing Library, lefthook for git hooks.

## Helper Prompts

1. Populate project context:
   "Please read openspec/project.md and help me fill it out with details about my project, tech stack, and conventions"
2. Create first change proposal:
   "I want to add [YOUR FEATURE HERE]. Please create an OpenSpec change proposal for this feature"
3. Learn the workflow:
   "Please explain the OpenSpec workflow from openspec/AGENTS.md and how I should work with you on this project"
