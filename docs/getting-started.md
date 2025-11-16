# Getting Started

This project uses Bun with Vite + React. Follow these steps to develop locally:

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Run the dev server** (port `3000` by default).

   ```bash
   bun --bun vite dev --port 3000
   ```

3. **Available scripts**
   - `bun --bun vite build` → production build
   - `bun --bun vite preview` → preview the build
   - `bun --bun tsc --noEmit` → strict typecheck via `tsc-files`
   - `bun --bun eslint . --max-warnings 0 --cache --cache-location ./node_modules/.cache/eslint/.eslintcache` → lint
   - `bun --bun vitest run` → full test suite
   - `bun --bun vitest run src/foo.test.ts -t "case"` → single test

4. **Editor setup**
   - Enable TypeScript strict mode support to surface unused symbols.
   - Run Prettier on save (semicolons + single quotes) and keep Tailwind classes sorted via the Prettier plugin.

5. **Before committing**
   - Execute lint, typecheck, and vitest to keep lefthook happy.
   - If lefthook warns about formatting, run `bun --bun prettier -uwl --cache .`.

Need help? Check `openspec/project.md` for architectural context and `AGENTS.md` for coding conventions.
