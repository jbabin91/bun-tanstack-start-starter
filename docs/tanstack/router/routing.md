# TanStack Router Routing Guide

This project uses **file-based routing**—the recommended approach for TanStack Router and TanStack Start.

> [!TIP]
> Using TanStack Start? For SSR lifecycle, request phases, and where code runs during initial render vs client navigation, see `../start/execution-model.md`.

## Route tree construction

- Routes are defined as files in `src/routes/` following naming conventions
- Nesting is determined by folder structure or dot notation (e.g., `posts.$postId.tsx`)
- TanStack Start auto-generates `routeTree.gen.ts` from your route files
- Pathless routes (id-only) act as layout containers; dynamic segments use `$param` syntax, splats use `$`
- Routes normalize paths (leading/trailing slashes ignored, except `/` index)

See `file-based-routing.md` and `file-naming-conventions.md` for detailed file patterns.

## Loader lifecycle

- `beforeLoad` runs before children and can throw redirects or load context
- `loaderDeps` returns values that uniquely identify the match (e.g., search params) and show up in `loader` as `deps`
- `loader`, `pendingComponent`, `errorComponent` participate in auto code splitting when left inline

## Authentication pattern

- Wrap protected routes with a layout (e.g., `/_authenticated`) that uses `beforeLoad` to check auth and `redirect` to `/login` with the current `location.href` stored in search
- Alternatively, guard inside the component and render a `<Login />` instead of `<Outlet />` for inline auth

See `authenticated-routes.md` for detailed examples.

## Auto code splitting

TanStack Start handles code splitting automatically via the `@tanstack/react-start` plugin. Keep route `component` and `loader` functions inline (don't export them) so Start can wrap and split them optimally.
