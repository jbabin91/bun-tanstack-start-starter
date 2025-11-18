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

✅ **COMPLETED** - All 30+ documentation files created and validated:

**Foundation & Navigation:**

- `AGENTS.md` - Quick reference with all docs indexed by category
- `overview.md` - What Query is, why use it, Router/Start integration
- `important-defaults.md` - Default behaviors and project conventions

**Critical Integration Patterns:**

- `query-options.md` - queryOptions factory pattern with hierarchical keys
- `suspense.md` - useSuspenseQuery + Router loader integration
- `mutations.md` - useMutation with server functions and Form planning
- `optimistic-updates.md` - Cache-based optimism with rollback
- `query-invalidation.md` - Invalidation scope selection strategies
- `infinite-queries.md` - Cursor-based pagination with search params
- `ssr-hydration.md` - Prefetch in loaders, dehydrate/hydrate flow
- `prefetching-router.md` - Intent-based prefetch patterns

**Core Concepts:**

- `queries.md`, `query-keys.md`, `query-functions.md`
- `parallel-queries.md`, `dependent-queries.md`
- `paginated-queries.md`, `initial-data.md`, `placeholder-data.md`

**Performance & Advanced:**

- `performance.md`, `render-optimizations.md`
- `advanced-ssr.md`, `mutation-updates.md`

**Additional Topics:**

- `network-mode.md`, `background-fetching.md`, `window-focus-refetching.md`
- `disabling-queries.md`, `query-retries.md`, `query-cancellation.md`
- `scroll-restoration.md`, `filters.md`, `default-query-function.md`
- `testing.md`, `faq.md`

**Cross-Linking:**

- ✅ Router `data-loading.md` - Added 5 Query doc links
- ✅ Start `server-functions.md` - Added Query integration links
- ✅ Start `selective-ssr.md` - Added SSR/hydration links

**Validation:**

- ✅ All 65 internal links validated (0 broken)
- ✅ All markdown linting passed
- ✅ Committed: 40 files, 3,932 insertions

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

**Change Complete** - Ready for archiving:

1. ✅ All 30+ documentation files created
2. ✅ Cross-links added to Router and Start docs
3. ✅ Link validation passing (65 links, 0 broken)
4. ✅ All linting and formatting passed
5. ✅ Committed to repository

**Post-Implementation:**

- Monitor for documentation drift and update as Query/Router/Start APIs evolve
- Consider adding visual diagrams for complex flows (loader → prefetch → hydrate)
- Gather user feedback on missing patterns or unclear sections
- Update when TanStack Form integration is implemented

## Impact

- Affected docs: New `docs/tanstack/query/**/*.md` files (~25-30 files)
- Cross-links needed: Router `data-loading.md`, Start `server-functions.md`, `ssr.md`
- No code changes; pure documentation
- Improves developer onboarding and reduces time debugging query/cache issues
