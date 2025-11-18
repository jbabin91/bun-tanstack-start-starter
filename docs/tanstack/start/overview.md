# TanStack Start Overview

Related ADR: [0002 — Adopt TanStack Start + TanStack Router](../../../openspec/specs/architecture/adrs/0002-tanstack-start-and-router.md)

TanStack Start is a full-stack framework that layers server rendering, routing, and server functions on top of TanStack Router and Vite. It keeps the client-first developer experience of TanStack Router but adds:

- **Full-document SSR + streaming** for fast first paint.
- **Server routes and server functions** for colocated API logic.
- **Type-safe routing** using the same file-based conventions from TanStack Router.
- **Bundler integration** (Vite) with automatic code splitting and hydration helpers.

Use TanStack Start when you need the convenience of a full-stack framework without giving up TanStack Router’s ergonomics or type safety.

> [!TIP]
> New to routing or loader lifecycle? See Router docs:
>
> - Routing overview and concepts: `../router/overview.md`, `../router/routing-concepts.md`
> - File-based routing and route trees: `../router/file-based-routing.md`, `../router/route-trees.md`
> - Loader lifecycle and caching: `../router/data-loading.md`
