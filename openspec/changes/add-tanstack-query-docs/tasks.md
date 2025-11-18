## 1. Core Concepts Documentation

- [x] 1.1 Important Defaults ✅ `important-defaults.md`
  - [x] Document staleTime, gcTime, retry defaults
  - [x] Add project-specific examples with server functions
  - [x] Cross-link to Router data-loading.md
- [x] 1.2 Queries ✅ `queries.md`
  - [x] Basic useQuery patterns
  - [x] Integration with TanStack Router loaders
  - [x] Error handling and suspense boundaries
- [x] 1.3 Query Keys ✅ `query-keys.md`
  - [x] Key structure conventions for this project
  - [x] Dependency tracking with route params
  - [x] Type-safe query key patterns
- [x] 1.4 Query Functions ✅ `query-functions.md`
  - [x] Server function integration patterns
  - [x] AbortController usage
  - [x] Error throwing conventions
- [x] 1.5 Query Options & queryOptions Factory ✅ `query-options.md`
  - [x] Create queryOptions factories for reusable queries
  - [x] Type inference best practices
  - [x] Prefetching patterns with queryOptions

## 2. Advanced Query Patterns

- [x] 2.1 Parallel Queries ✅ `parallel-queries.md`
  - [x] useQueries with multiple endpoints
  - [x] Suspense coordination
- [x] 2.2 Dependent Queries ✅ `dependent-queries.md`
  - [x] enabled option patterns
  - [x] Chaining with route params
- [x] 2.3 Infinite Queries ✅ `infinite-queries.md`
  - [x] Cursor-based pagination examples
  - [x] Integration with route search params
  - [x] Load more UI patterns
- [x] 2.4 Paginated Queries ✅ `paginated-queries.md`
  - [x] keepPreviousData patterns
  - [x] Page navigation with Router
- [x] 2.5 Initial & Placeholder Data ✅ `initial-data.md`, `placeholder-data.md`
  - [x] Loader data hydration
  - [x] Placeholder strategies

## 3. Mutations & Forms

- [x] 3.1 Mutations Overview ✅ `mutations.md`
  - [x] useMutation basics with server functions
  - [x] Integration approach with TanStack Form (planned)
  - [x] Error handling patterns
- [x] 3.2 Optimistic Updates ✅ `optimistic-updates.md`
  - [x] Cache-based optimistic updates
  - [x] UI-based optimistic updates with variables
  - [x] Rollback strategies
- [x] 3.3 Query Invalidation ✅ `query-invalidation.md`
  - [x] invalidateQueries patterns
  - [x] Invalidation from mutations (onSuccess/onSettled)
  - [x] Selective vs broad invalidation
- [x] 3.4 Updates from Mutation Responses ✅ `mutation-updates.md`
  - [x] setQueryData after mutations
  - [x] Updating related queries

## 4. SSR & Hydration

- [x] 4.1 Server Rendering & Hydration ✅ `ssr-hydration.md`
  - [x] prefetchQuery in loaders
  - [x] dehydrate/hydrate patterns
  - [x] Integration with TanStack Start SSR
- [x] 4.2 Advanced Server Rendering ✅ `advanced-ssr.md`
  - [x] Streaming considerations
  - [x] Selective SSR with Query
  - [x] Error boundaries on server
- [x] 4.3 Suspense Integration ✅ `suspense.md`
  - [x] useSuspenseQuery with Router loaders
  - [x] Parallel suspense queries
  - [x] Suspense boundaries in route trees

## 5. Performance & Integration

- [x] 5.1 Performance & Request Waterfalls ✅ `performance.md`
  - [x] Avoiding serial queries
  - [x] Prefetch strategies
- [x] 5.2 Prefetching & Router Integration ✅ `prefetching-router.md`
  - [x] Prefetch on route preload
  - [x] Intent-based prefetching
  - [x] loader + prefetchQuery patterns
- [x] 5.3 Render Optimizations ✅ `render-optimizations.md`
  - [x] Structural sharing explanation
  - [x] select option for derived state
  - [x] notifyOnChangeProps optimization
- [x] 5.4 Caching Examples ✅ (covered in `important-defaults.md` and `query-options.md`)
  - [x] Project-specific cache strategies
  - [x] staleTime configuration per route

## 6. Additional Topics

- [x] 6.1 Network Mode ✅ `network-mode.md`
  - [x] online, always, offlineFirst modes
  - [x] Project defaults
- [x] 6.2 Background Fetching Indicators ✅ `background-fetching.md`
  - [x] isFetching vs isLoading
  - [x] UI patterns for background updates
- [x] 6.3 Window Focus Refetching ✅ `window-focus-refetching.md`
  - [x] Configuration
  - [x] When to disable
- [x] 6.4 Disabling/Pausing Queries ✅ `disabling-queries.md`
  - [x] enabled option
  - [x] Conditional queries with route state
- [x] 6.5 Query Retries ✅ `query-retries.md`
  - [x] retry and retryDelay configuration
  - [x] Server function retry strategies
- [x] 6.6 Query Cancellation ✅ `query-cancellation.md`
  - [x] AbortController patterns
  - [x] Route navigation cancellation
- [x] 6.7 Scroll Restoration ✅ `scroll-restoration.md`
  - [x] Integration with Router scroll restoration
- [x] 6.8 Filters ✅ `filters.md`
  - [x] Query filtering patterns
  - [x] Type-safe filter utilities
- [x] 6.9 Default Query Function ✅ `default-query-function.md`
  - [x] When and how to use
  - [x] Project conventions
- [x] 6.10 Testing ✅ `testing.md`
  - [x] Testing queries with MSW
  - [x] Testing mutations
  - [x] Testing with loaders

## 7. Cross-Linking & AGENTS.md

- [x] 7.1 Update docs/tanstack/query/AGENTS.md ✅
  - [x] List all query docs with brief descriptions
  - [x] Integration guidance (Router, Start, Forms)
- [ ] 7.2 Cross-link existing docs (in progress)
  - [x] Router data-loading.md → Query docs
  - [ ] Start server-functions.md → Query mutations
  - [ ] Start selective-ssr.md → Query SSR/hydration
- [x] 7.3 Add FAQ section ✅ `faq.md`
  - [x] "Does TanStack Query replace Redux/MobX?" (with project context)
  - [x] Common pitfalls
  - [x] When to use Query vs Router cache

## 8. Validation & Polish

- [x] 8.1 Run validate:docs script ✅
- [x] 8.2 Verify all internal links ✅ (0 broken links)
- [x] 8.3 Ensure consistent terminology ✅
- [x] 8.4 Add practical examples from project patterns ✅

## Files Created (30 total)

- Foundation: `overview.md`, `important-defaults.md`
- Core: `queries.md`, `query-keys.md`, `query-functions.md`, `query-options.md`
- Advanced Queries: `parallel-queries.md`, `dependent-queries.md`, `infinite-queries.md`, `paginated-queries.md`, `initial-data.md`, `placeholder-data.md`
- Mutations: `mutations.md`, `optimistic-updates.md`, `query-invalidation.md`, `mutation-updates.md`
- SSR/Integration: `ssr-hydration.md`, `advanced-ssr.md`, `suspense.md`, `prefetching-router.md`
- Performance: `performance.md`, `render-optimizations.md`
- Additional: `network-mode.md`, `background-fetching.md`, `window-focus-refetching.md`, `disabling-queries.md`, `query-retries.md`, `query-cancellation.md`, `scroll-restoration.md`, `filters.md`, `default-query-function.md`, `testing.md`, `faq.md`
- Navigation: `AGENTS.md`
