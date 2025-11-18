# SSR & Hydration

Server-Side Rendering (SSR) prefetches queries, serializes their cache, and hydrates on the client to avoid duplicate fetching and loading flashes.

## Flow Overview

1. Router loader runs on server
2. Loader calls `queryClient.prefetchQuery(factory())` for required queries
3. Server renders components (queries read cached data) producing HTML
4. Query cache dehydrates and embeds in HTML
5. Client hydrates; `useSuspenseQuery` reads cache immediately

## Loader Prefetch Pattern

```ts
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions());
  },
  component: PostsPage,
});
```

Multiple queries:

```ts
await Promise.all([
  queryClient.prefetchQuery(userOptions()),
  queryClient.prefetchQuery(settingsOptions()),
]);
```

## Dehydration & Hydration

Your app root should wrap with `QueryClientProvider` and perform dehydrate/hydrate (TanStack Start integration typically handles this). Ensure query keys and options match exactly client-side.

## Avoid Double Fetching

Match factory usage in loader and component:

```tsx
const { data } = useSuspenseQuery(postsOptions()); // No duplicate fetch
```

If component passes different options (e.g. different staleTime) it is treated as distinct query and refetches.

## Selective SSR

Not all queries need server prefetch. Strategies:

| Query Type                     | Strategy                         |
| ------------------------------ | -------------------------------- |
| Above-fold critical            | Prefetch in loader               |
| Below-fold secondary           | Defer; wrap subtree in Suspense  |
| User-specific (auth gating)    | Prefetch only if session present |
| Fast ephemeral (notifications) | Let client fetch                 |

## Streaming (Deferred Sections)

Split critical vs deferred queries:

```tsx
function Dashboard() {
  const { data: core } = useSuspenseQuery(coreStatsOptions());
  return (
    <>
      <CoreStats data={core} />
      <Suspense fallback={<MiniSpinner />}>
        <DeferredStats />
      </Suspense>
    </>
  );
}
```

Server can stream once core is ready; deferred section hydrates later.

## Initial Data vs Prefetch

`initialData` seeds cache only for client-side usage. For SSR prefer full prefetch + dehydration so both server and client share identical state.

`placeholderData` provides a temporary value until real data arrives—avoid in SSR-critical queries (prefetch instead).

## Handling Staleness After Hydration

If `staleTime` is 0, queries may refetch right after hydration. For UX stability set small positive staleTime (e.g. `5_000`) on critical queries to avoid immediate background refetch flicker.

## Error Boundaries

Server-thrown errors from query functions should surface in error boundary fallbacks. Ensure loader catches recoverable issues if you want to render partial content instead.

## Cross-Route Cache Sharing

Prefetched queries remain cached for subsequent navigations (within gcTime). Avoid refetching identical queries on every route by using consistent factories.

## Anti-Patterns

| Anti-pattern                             | Fix                                     |
| ---------------------------------------- | --------------------------------------- |
| Prefetching every possible query         | Prefetch only required for initial view |
| Divergent query options server vs client | Use shared factories                    |
| Using `initialData` for SSR              | Use prefetch + dehydration              |
| Refetch storm on hydration               | Set appropriate `staleTime`             |

## Cross-References

- Prefetch strategies: `./prefetching-router.md`
- Initial data specifics: `./initial-data.md`
- Suspense defer pattern: `./suspense.md`

## Summary

SSR with TanStack Query hinges on loader prefetch + consistent factory usage. Dehydrate server cache to client, selectively prefetch only critical queries, and control staleness to prevent immediate refetch churn.
