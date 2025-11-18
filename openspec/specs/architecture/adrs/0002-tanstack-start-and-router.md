# ADR 0002: Adopt TanStack Start + TanStack Router

- Status: Accepted
- Date: 2025-11-18

## Context

We need a React-first app framework with file-based routing, SSR, server functions, and strong type safety without being tied to a monolithic meta-framework. The project already documents Router/Start patterns and SSR.

## Decision

Adopt TanStack Start with TanStack Router as the application foundation.

- Use file-based routing in `src/routes` with generated `routeTree.gen.ts`
- Use route loaders + `@tanstack/react-query` integration for data fetching
- Use Start server functions and middleware for backend interaction
- Prefer selective SSR and hydration strategies as documented

## Consequences

- Consistent routing model across SPA/SSR
- First-class integration with TanStack Query and type-safe route params/search
- Clear separation of concerns for loaders, components, and server functions

## Alternatives Considered

- Next.js — mature but heavier abstractions; opinionated filesystem semantics; less direct control over Router primitives used here
- Remix — strong loader/action model; routing primitives differ from TanStack Router and introduce migration cost
- Vite + react-router — lightweight but lacks the type-safe route API and built-in SSR integration we rely on

## References

- docs/tanstack/router/
- docs/tanstack/start/
- `src/routes/` and `src/router.tsx`
