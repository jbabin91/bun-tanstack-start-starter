g# Change: Add TanStack Query Documentation

## Why

TanStack Query is a core dependency in this project but lacks dedicated documentation. Users need comprehensive, project-specific guidance on data fetching, caching, mutations, and integration with TanStack Start/Router. Official docs are generic; we need practical examples tailored to our stack (server functions, form integration, SSR patterns).

## What Changes

- Add `docs/tanstack/query/` directory with comprehensive guides covering:
  - Core concepts: queries, mutations, caching, invalidation
  - Integration patterns: TanStack Start/Router, server functions, loaders, suspense
  - Advanced topics: infinite queries, optimistic updates, SSR/hydration, prefetching
  - Best practices: queryOptions factories, form integration via TanStack Form
- Cross-link with existing Router and Start docs
- Focus on practical patterns used in this project (server functions, loader integration, form mutations)

## Progress

Implemented foundation and core integration docs:

- Navigation: `AGENTS.md`
- Foundations: `overview.md`, `important-defaults.md`
- Factories: `query-options.md`
- Suspense: `suspense.md`
- Mutations: `mutations.md`, `optimistic-updates.md`, `query-invalidation.md`

Upcoming (next phase):

- Pagination: `infinite-queries.md`, `paginated-queries.md`
- SSR/Hydration: `ssr-hydration.md`, `initial-data.md`, `prefetching-router.md`
- Core extras: `queries.md`, `query-keys.md`, `query-functions.md`, `parallel-queries.md`, `dependent-queries.md`
- Additional topics & FAQ

## Design Highlights

- Hierarchical queryOptions factory namespaces for all reusable queries
- Loader prefetch + `useSuspenseQuery` consumption pattern standardized
- Mutation guidance prefers targeted cache edits before invalidation
- Optimistic mechanisms documented with rollback context handling
- Invalidation scope selection table to reduce broad stale marking

## Risks

- Documentation drift: mitigate via validation runs and periodic review
- Over-invalidation guidance misuse: reinforce targeted `setQueryData` patterns

## Next Steps

1. Implement infinite & paginated query docs
2. Document SSR hydration and prefetch flows
3. Add remaining core concept docs (keys, functions, parallel/dependent)
4. Add network/offline, retries, cancellation, testing, FAQ
5. Cross-link Router/Start docs to new Query docs
6. Run link validation and finalize terminology

## Impact

- Affected docs: New `docs/tanstack/query/**/*.md` files (~25-30 files)
- Cross-links needed: Router `data-loading.md`, Start `server-functions.md`, `ssr.md`
- No code changes; pure documentation
- Improves developer onboarding and reduces time debugging query/cache issues
