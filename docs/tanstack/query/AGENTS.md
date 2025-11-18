# TanStack Query Documentation

Quick reference for AI assistants working with TanStack Query in this project.

## Integration Context

This project uses TanStack Query v5 with:

- **TanStack Router**: Prefetch queries in loaders, consume with useSuspenseQuery
- **TanStack Start**: Server functions as query functions, SSR/hydration patterns
- **TanStack Form** (planned): Form state + mutations for server persistence

## Critical Patterns

### queryOptions Factory Pattern

Always create queryOptions factories for reusable queries:

```ts
// src/lib/query-options/posts.ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Loader Integration

Prefetch in loader, consume with useSuspenseQuery:

```ts
// Route loader
loader: async ({ context: { queryClient } }) => {
  await queryClient.prefetchQuery(postsOptions())
}

// Component
function PostsPage() {
  const { data } = useSuspenseQuery(postsOptions())
  return <PostsList posts={data} />
}
```

### Server Function as Query Function

```ts
import { createServerFn } from '@tanstack/react-start';

export const getPostsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.posts.findMany();
  },
);

export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
  });
}
```

## Documentation Files

### Foundation

- **[overview.md](./overview.md)** - What Query is, why we use it, integration overview
- **[important-defaults.md](./important-defaults.md)** - Defaults + project conventions

### Core Concepts ⭐

- **[query-options.md](./query-options.md)** ⭐ - queryOptions factory pattern (critical)
- **[suspense.md](./suspense.md)** ⭐ - useSuspenseQuery + loader integration
- **[queries.md](./queries.md)** - Basic useQuery patterns
- **[query-keys.md](./query-keys.md)** - Key conventions for this project
- **[query-functions.md](./query-functions.md)** - Server function integration
- **[parallel-queries.md](./parallel-queries.md)** - useQueries patterns
- **[dependent-queries.md](./dependent-queries.md)** - enabled + route param patterns

### Advanced Queries ⭐

- **[infinite-queries.md](./infinite-queries.md)** ⭐ - Cursor-based pagination
- **[paginated-queries.md](./paginated-queries.md)** - keepPreviousData patterns
- **[initial-data.md](./initial-data.md)** - Hydration from loaders
- **[placeholder-data.md](./placeholder-data.md)** - Loading state strategies

### Mutations & Forms ⭐

- **[mutations.md](./mutations.md)** ⭐ - useMutation + server functions
- **[optimistic-updates.md](./optimistic-updates.md)** ⭐ - Cache & UI-based patterns
- **[query-invalidation.md](./query-invalidation.md)** - invalidateQueries strategies
- **[mutation-updates.md](./mutation-updates.md)** - setQueryData from mutations

### SSR & Hydration ⭐

- **[ssr-hydration.md](./ssr-hydration.md)** ⭐ - prefetchQuery in loaders
- **[advanced-ssr.md](./advanced-ssr.md)** - Streaming, selective SSR
- **[prefetching-router.md](./prefetching-router.md)** ⭐ - Prefetch on route preload

### Performance & Optimization

- **[performance.md](./performance.md)** - Waterfalls, select, structural sharing
- **[render-optimizations.md](./render-optimizations.md)** - notifyOnChangeProps

### Additional Topics

- **[network-mode.md](./network-mode.md)** - online/always/offlineFirst
- **[background-fetching.md](./background-fetching.md)** - isFetching indicators
- **[window-focus-refetching.md](./window-focus-refetching.md)** - Configuration
- **[disabling-queries.md](./disabling-queries.md)** - enabled option patterns
- **[query-retries.md](./query-retries.md)** - retry + retryDelay
- **[query-cancellation.md](./query-cancellation.md)** - AbortController with routes
- **[scroll-restoration.md](./scroll-restoration.md)** - Router integration
- **[filters.md](./filters.md)** - Query filtering utilities
- **[default-query-function.md](./default-query-function.md)** - Global defaults
- **[testing.md](./testing.md)** - MSW, loader tests
- **[faq.md](./faq.md)** - Redux/MobX comparison, pitfalls

## Quick Decisions

- **Always use queryOptions factories** for type safety and reusability
- **Prefetch in loaders** for SSR and instant page loads
- **Use useSuspenseQuery in components** for guaranteed data
- **Server functions = data access, Query = orchestration**
- **Store pagination state in URL search params** for shareability
- **Use optimistic updates sparingly** - only for instant UX needs

## Related Documentation

- **Router Data Loading**: `@/docs/tanstack/router/data-loading.md`
- **Router Authenticated Routes**: `@/docs/tanstack/router/authenticated-routes.md`
- **Start Server Functions**: `@/docs/tanstack/start/server-functions.md`
- **Start SSR**: `@/docs/tanstack/start/ssr.md`
- **Start Authentication**: `@/docs/tanstack/start/authentication.md`
- **Start Error Boundaries**: `@/docs/tanstack/start/error-boundaries.md`

## External Resources

- [Official TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Query Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools)
- [Query Examples](https://tanstack.com/query/latest/docs/framework/react/examples)
- Community Blog (Query Options API): [https://tkdodo.eu/blog/the-query-options-api](https://tkdodo.eu/blog/the-query-options-api)
- Community Blog (Automatic Invalidation): [https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations)
