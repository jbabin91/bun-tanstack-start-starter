# Architecture

This starter demonstrates how TanStack Start stitches together routing, data fetching, and SSR with Bun.

## Routing layers

- `src/router.tsx` initializes the router with generated `routeTree.gen.ts`.
- Each file under `src/routes` declares a route via `createFileRoute`. Shared layout lives in `__root.tsx`.
- Routes can opt into SSR modes (`start/ssr`) or client-only primitives, so handle loaders appropriately.

## Data fetching approaches

- **Route loaders**: Use `loader`/`Route.useLoaderData()` for data needed before initial render. Works server-side and client-side.
- **TanStack Query**: Wrap the app with `src/integrations/tanstack-query/root-provider.tsx` and access `useQuery` for reactive caching. Devtools wired via `src/integrations/tanstack-query/devtools.tsx`.
- **Server functions**: `createServerFn` enables file-scoped RPC handlers (`src/routes/demo/start/server-funcs.tsx`). Keep I/O (e.g., `fs`) inside handlers to avoid bundling issues.

## Styling + design system

- Tailwind v4 powers global styles (`src/styles/globals.css`).
- UI primitives live under `src/components/ui` and follow coss ui + Base UI guidance (`AGENTS.md` in that folder).
- Layout-level components (headers, shells) reside in `src/components/layouts` or `src/routes/__root.tsx`.

## State & hooks

- Prefer TanStack Query or route loaders for data; use local hooks (`src/hooks`) for client-only utilities (copy-to-clipboard, viewport checks).
- Keep hooks SSR-safe by guarding `window` usage.

## Build/runtime pipeline

- Bun runs the dev server and compiles TypeScript via Vite.
- Production build emits `.output/` for Start deployment.
- Lefthook enforces lint/type/test before commits—avoid bypassing it to keep the starter reproducible.
