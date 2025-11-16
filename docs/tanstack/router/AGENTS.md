# TanStack Router Documentation

Always open `@/docs/tanstack/router/AGENTS.md` when you need to:

- Work on routing features (dynamic routes, loaders, navigation, search params)
- Understand how routes are structured and configured in this project
- Debug routing issues or add new route patterns
- Understand data loading lifecycle, caching, and preloading strategies
- Implement authentication/authorization patterns with routes
- Configure SSR behavior or server-side concerns

Use these docs to learn:

- **routing-concepts.md** - Core routing primitives (dynamic segments, layouts, pathless routes)
- **routing.md** - Code-based vs file-based routing, route tree construction, loader lifecycle
- **file-based-routing.md** - File system conventions and benefits over manual setup
- **file-naming-conventions.md** - Complete reference of file naming patterns
- **navigation.md** - Navigation APIs (`<Link>`, `useNavigate()`, `<Navigate>`)
- **path-params.md** - Dynamic segment usage and typed params
- **search-params.md** - Query string validation, reading/writing, search middlewares
- **data-loading.md** - Route loaders, SWR caching, stale-while-revalidate patterns
- **preloading.md** - Intent/viewport/render preloading strategies and caching
- **route-matching.md** - How routes are sorted and matched by specificity
- **outlets.md** - Nested rendering and layout composition
- **custom-link.md** - Creating type-safe custom link components
- **api.md** - Quick API reference for types and behaviors
- **type-utilities.md** - Type-safe patterns for complex routing scenarios
- **type-safety.md** - TypeScript performance and narrowing techniques
- **document-head.md** - Managing head, meta, title tags for SEO and page attributes
- **route-masking.md** - Masking URLs while navigating to different routes
- **navigation-blocking.md** - Preventing navigation when users have unsaved changes
- **search-serialization.md** - ⚠️ Advanced/Optional: Customizing URL search param encoding/decoding
- **router-context.md** - Dependency injection and context passing through routes
- **not-found.md** - Handling non-matching routes and missing resources
- **authenticated-routes.md** - Protecting routes and implementing auth patterns
- **scroll-restoration.md** - Managing scroll behavior and restoration
- **static-data.md** - Attaching static metadata to routes
- **ssr.md** - Non-streaming and streaming server-side rendering setup
- **render-optimizations.md** - Structural sharing and fine-grained selectors
- **tanstack-query-integration.md** - TanStack Query SSR integration and streaming

## Project Context

This project uses **TanStack Start**, which includes TanStack Router as its routing layer. The build, code-splitting, and type generation are all handled by Start—these docs focus on understanding and using the routing capabilities.

Key patterns in this project:

- Routes are file-based (auto-generated `routeTree.gen.ts`)
- Router context is managed via `src/integrations/tanstack-router/router.tsx`
- Root route uses `shellComponent` for SSR with optional component SSR control via `ssr: false`
- Providers (theme, query client) are wrapped via the router's `Wrap` option or passed as context
- Default preload strategy is `intent` (hover/touch detection)

## Common Tasks

- **Add a new route**: Create a file in `src/routes/` following naming conventions in `file-naming-conventions.md`
- **Load data for a route**: Use `loader` in route config; see `data-loading.md` for lifecycle and caching
- **Add navigation**: Use `<Link>` component with type-safe `to` and `params`; see `navigation.md`
- **Handle auth**: Use `beforeLoad` to check auth state and redirect; see `routing.md` for pattern
- **Configure search params**: Use `validateSearch` with a validator (Zod, Valibot, etc.); see `search-params.md`
- **Debug routing**: Check `route-matching.md` for specificity rules; enable devtools in `src/integrations/tanstack-router/devtools.tsx`
