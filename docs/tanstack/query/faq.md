# FAQ

## Does TanStack Query replace Redux/MobX?

No. Query manages server state (fetched, cached, synchronized) while Redux/MobX manage client state (UI, local-only data). Use Query for remote data and a minimal client-state solution for local concerns.

## When should I use Router loader cache vs Query?

- Router loader cache: Truly static or route-local data with no refetching needs
- Query: Shared data across routes, background refetching, mutations, optimistic updates

## How do I avoid double fetching with SSR?

Use identical factories in loader (`prefetchQuery(factory())`) and component (`useSuspenseQuery(factory())`). Ensure query keys and options match exactly.

## Should I invalidate or use setQueryData after mutations?

Prefer `setQueryData` when the change is small and predictable (append, update fields). Invalidate when impact spans many queries or is complex to merge.

## Can I use Query without Suspense?

Yes. Use `useQuery` and handle `isLoading`/`error`. For loader-prefetched pages, `useSuspenseQuery` simplifies components.

## How to persist cache across sessions?

Use Query persistors (not configured here) to save the cache to storage and restore on load—be mindful of data freshness and invalidation.

## How to handle forms?

Use TanStack Form (planned) for field state and validation. Use mutations for server persistence and cache reconciliation.

## Is a default query function recommended?

Not in this project. Prefer explicit factories for type safety and clarity.

## Cross-References

- Mutations & invalidation: `./mutations.md`, `./query-invalidation.md`
- SSR & prefetching: `./ssr-hydration.md`, `./prefetching-router.md`
- Factories: `./query-options.md`
