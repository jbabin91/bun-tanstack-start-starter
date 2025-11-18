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

## Keep Server and Client State Separate

Avoid copying query data into local state unless you have a specific reason (like initializing a form). Copying opts you out of background updates:

```tsx
// ❌ Loses background updates
const { data } = useQuery(userOptions());
const [user, setUser] = React.useState(data);

// ✅ Always shows latest
const { data: user } = useQuery(userOptions());
```

If you need to initialize a form, set `staleTime: Infinity` to prevent unnecessary background fetches:

```tsx
const { data } = useQuery({
  ...formDefaults(),
  staleTime: Infinity,
});
return data ? <MyForm initialData={data} /> : null;
```

For editable data, keep server state and draft state separate—don't merge them into one local state variable.

## Status Checks: Check Data First

When queries aggressively refetch (window focus, reconnect), background errors can replace valid stale data. Check for data availability first:

```tsx
// ❌ Standard pattern can be confusing
const todos = useTodos();
if (todos.isPending) return 'Loading...';
if (todos.error) return 'Error: ' + todos.error.message;
return <div>{todos.data.map(renderTodo)}</div>;
```

Problem: If a background refetch fails, you have both `error` and stale `data`. Showing the error screen removes working data from the user.

```tsx
// ✅ Check data first for better UX
const todos = useTodos();
if (todos.data) {
  return <div>{todos.data.map(renderTodo)}</div>;
}
if (todos.error) return 'Error: ' + todos.error.message;
return 'Loading...';
```

Now stale data stays visible during background errors. Users see the last known good state instead of an error screen. Consider showing a background error indicator if needed.

**Context**: With `refetchOnWindowFocus`, `refetchOnReconnect`, and retry attempts (3 retries × exponential backoff), background fetches can take seconds. Replacing data with an error during this time is jarring.

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
