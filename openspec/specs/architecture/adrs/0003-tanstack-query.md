# ADR 0003: Adopt TanStack Query for Data Fetching

- Status: Accepted
- Date: 2025-11-18

## Context

We need predictable client/server data synchronization, caching, SSR hydration, mutations, and invalidation—without building bespoke state machinery. The codebase already integrates Query and extensive documentation exists.

## Decision

Adopt `@tanstack/react-query` for data fetching, caching, and mutations.

- Use `queryOptions()` factories with hierarchical keys for type safety
- Validate server responses in `queryFn` as needed (e.g., zod)
- Prefer fine-grained subscriptions with `select` and structural sharing
- Use route loaders for prefetching + hydration where applicable
- Apply optimistic updates with cancellation and scoped invalidation

## Consequences

- Fewer race conditions and better UI state (loading/empty/error) handling
- Type-safe data access and safer cache reads via options factories
- Consistent SSR and client hydration story across routes

## Alternatives Considered

- SWR — minimal and ergonomic, but fewer built-in primitives for mutations/invalidation and SSR integration we rely on
- Redux Toolkit Query — opinionated; couples to Redux; more boilerplate for this stack
- Custom fetch + useEffect — flexible but error-prone and duplicative of Query features

## References

- docs/tanstack/query/
- `src/integrations/tanstack-query/`
