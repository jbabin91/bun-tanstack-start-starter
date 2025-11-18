# Queries

Queries read server state (via server functions) and manage caching, background refetching, and loading/error lifecycles.

## useQuery vs useSuspenseQuery

| Hook               | Loading Handling                  | Data Guarantee                      | When to Use                                  |
| ------------------ | --------------------------------- | ----------------------------------- | -------------------------------------------- |
| `useQuery`         | `isLoading`/`isFetching` booleans | `data` may be `undefined` initially | Granular UI states, conditional skeletons    |
| `useSuspenseQuery` | Suspense fallback boundary        | `data` always defined               | Loader prefetch + simplified component logic |

## Basic useQuery

```tsx
function UserProfile() {
  const { data, isLoading, error } = useQuery(userOptions());
  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ErrorPanel error={error} />;
  return <Profile data={data} />;
}
```

## Suspense Variant

```tsx
function UserProfile() {
  const { data } = useSuspenseQuery(userOptions());
  return <Profile data={data} />;
}
```

Wrap parent with `<Suspense fallback={...}>`.

## Parallel Simple Queries

Use multiple independent `useSuspenseQuery` calls when components are separate (React automatically batches). Use `useSuspenseQueries` for grouped parallel resolution.

## Retry Behavior

Queries retry transient failures by default (`retry: 3`). Customize per factory:

```ts
export function criticalDataOptions() {
  return queryOptions({
    queryKey: ['critical'],
    queryFn: () => getCriticalDataFn(),
    retry: (count, error) => {
      if (
        error instanceof Response &&
        error.status >= 400 &&
        error.status < 500
      )
        return false;
      return count < 5;
    },
  });
}
```

## Selecting Data

Use `select` to derive view data and minimize re-renders:

```tsx
const { data: summary } = useQuery({
  ...statsOptions(),
  select: (raw) => ({
    total: raw.items.length,
    open: raw.items.filter((i) => !i.closed).length,
  }),
});
```

## Background Indicators

`isFetching` signals refetch activity even when data is already present:

```tsx
const { data, isFetching } = useQuery(postsOptions());
return (
  <>
    {isFetching && <Spinner size="xs" />}
    <PostsList posts={data} />
  </>
);
```

## Manual Refetch

```tsx
const { refetch } = useQuery(postsOptions())
<button onClick={() => refetch()}>Refresh</button>
```

Avoid frequent manual refetch—leverage automatic staleness + focus/refocus triggers.

## Disabled (Conditional) Queries

```tsx
const enabled = Boolean(userId);
const { data } = useQuery({
  ...userDetailOptions(userId),
  enabled,
});
```

Query does not execute until `enabled` becomes true.

## Abortable Queries

Use AbortController in server function or fetch implementation; Query will pass signal if using `queryFn: ({ signal }) => ...` signature (advanced pattern—optional here).

## Query Status Inspection

Access status for custom logic:

```tsx
const state = useQueryState(postsOptions().queryKey);
if (state?.status === 'pending') {
  /* show skeleton */
}
```

## Further Reading

- Status Checks in React Query: <https://tkdodo.eu/blog/status-checks-in-react-query>
- Error Handling: <https://tkdodo.eu/blog/react-query-error-handling>

## Anti-Patterns

| Anti-pattern                                | Fix                               |
| ------------------------------------------- | --------------------------------- |
| Multiple manual `fetch` + `useState` clones | Replace with query factory + hook |
| Manual deduplication logic                  | Let Query handle caching          |
| Suppressing all retries globally            | Tailor per query needs            |
| Derived filtering done on every render      | Use `select`                      |

## Cross-References

- Factories: `./query-options.md`
- Suspense: `./suspense.md`
- Query keys: `./query-keys.md`

## Summary

Choose `useSuspenseQuery` for prefetched routes and simplicity; use `useQuery` when you need granular states or conditional enablement. Prefer factories, leverage `select`, and minimize manual refetch patterns.
