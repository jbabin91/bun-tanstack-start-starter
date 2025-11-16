# Layout Components Instructions

- Scope: `src/components/layouts` and nested files.
- Layout primitives should stay framework-agnostic where possible: keep data-fetching, router hooks, and contextual state in higher-level routes.
- Favor composition: accept `children`, `slots`, or render props to keep headers/footers reusable across demos.
- Use utilities from `@/lib/utils` and shared icons/buttons instead of duplicating Tailwind styles.
- Keep Tailwind class names short and ordered (layout → spacing → color → state). Prefer CSS variables (e.g., `bg-sidebar`) already defined globally.
- Avoid importing app-specific data directly; keep small module-level configs (e.g., `NAV_ITEMS`) colocated and export props so routes can override them.
- Prefer TanStack Router primitives (`Link`, `activeProps`) for navigation state instead of manual pathname checks.
- Document any layout-specific behavior (sticky position, portals, etc.) via short comments near the JSX.
- Tests: prioritize visual/manual verification; add vitest tests only when layout components include logic.
- When adding new files, update `src/routes/__root.tsx` or relevant entry points to consume them.
- Format with Prettier before committing.
