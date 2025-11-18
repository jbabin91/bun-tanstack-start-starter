# Suspense Integration

Suspense lets React pause rendering while data loads. TanStack Query provides `useSuspenseQuery` and `useSuspenseQueries` which throw promises until data resolves.

## Why useSuspenseQuery?

- Guarantees `data` is defined (no `undefined` checks)
- Pairs cleanly with Error Boundaries
- Simplifies loading state logic (fallback is handled by `<Suspense>`)
- Works perfectly with router loaders prefetching queries (no spinner flicker)

## Basic Pattern

```tsx
function PostsPage() {
  const { data } = useSuspenseQuery(postsOptions());
  return <PostsList posts={data} />;
}
```

Wrap route component (or layout) in `<Suspense>`:

```tsx
<Suspense fallback={<Spinner />}>
  <PostsPage />
</Suspense>
```

## Loader + Suspense Synergy

Prefetch in the route loader; Suspense boundary rarely shows fallback (only on slow network or during initial server render if not prefetched).

```ts
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions());
  },
  component: PostsPage,
});
```

If prefetch completes before component mounts, `useSuspenseQuery` reads cache immediately and does not suspend.

## Parallel Queries

Use `useSuspenseQueries` for multiple queries that should resolve together:

```tsx
const results = useSuspenseQueries({
  queries: [userOptions(), settingsOptions(), notificationsOptions()],
});

const [user, settings, notifications] = results.map((r) => r.data);
```

- Suspends until ALL queries have data
- If some are already cached and fresh, only missing ones fetch

## Fine-Grained Boundaries

Split sections to avoid blocking entire page:

```tsx
<Suspense fallback={<SidebarSkeleton />}>
  <Sidebar />
</Suspense>
<Suspense fallback={<MainSkeleton />}>
  <MainContent />
</Suspense>
```

Only the subtree with missing data suspends.

## Error Boundaries

Combine Suspense + Error Boundary for robust handling:

```tsx
<ErrorBoundary fallback={<ErrorPanel />}>
  <Suspense fallback={<LoadingPanel />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>
```

Errors thrown by query functions propagate to the nearest Error Boundary. Use server function exceptions intentionally (return structured validation errors instead of throwing for user input issues).

## Progressive Enhancement

If a critical query is slow, consider splitting into minimal immediate data + deferred secondary query:

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

function DeferredStats() {
  const { data } = useSuspenseQuery(fullStatsOptions());
  return <FullStats data={data} />;
}
```

## Switching Between useQuery and useSuspenseQuery

Use `useSuspenseQuery` when:

- Loader prefetches data
- Component sits within a Suspense boundary
- You want guaranteed defined `data`

Use `useQuery` when:

- You need granular loading states (`isLoading`, `isFetching`)
- You want to show skeletons conditionally rather than fallback for entire boundary
- Component cannot be wrapped with Suspense (rare)

## Handling Slow Networks

If fallback appears frequently due to network latency:

- Increase Suspense granularity (smaller boundaries)
- Prefetch earlier (hover, intersection observer, intent-based prefetch)
- Add skeleton UI inside boundary using partial hydration (optional)

## Query Factories + Suspense

Factories return full option objects, making Suspense usage trivial:

```tsx
const { data } = useSuspenseQuery(todoQueries.detail(id));
```

No duplication of key or function.

## SSR Considerations

During SSR, prefetch queries before rendering HTML. If all queries resolve server-side, client hydration avoids Suspense fallback.

If some queries are intentionally deferred (streaming), wrap those sections in Suspense so they hydrate progressively.

## Anti-Patterns

| Anti-pattern                                               | Fix                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| Mixing manual `isLoading` branching with Suspense fallback | Use one approach consistently                                  |
| Wrapping every small component with Suspense               | Group related queries; limit boundaries                        |
| Throwing validation errors for forms                       | Return structured errors; reserve throws for exceptional cases |

## Cross-References

- Query factories: `./query-options.md`
- SSR/Hydration: `./ssr-hydration.md`
- Prefetching: `./prefetching-router.md`

## Summary

Prefetch queries in loaders and consume with `useSuspenseQuery` for instant, defined data and minimal loading code. Use `useSuspenseQueries` for coordinated parallel loading, split Suspense boundaries for responsiveness, and pair with Error Boundaries for robust failure handling.
