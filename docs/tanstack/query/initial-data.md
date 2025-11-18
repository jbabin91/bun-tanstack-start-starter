# Initial & Placeholder Data

`initialData` and `placeholderData` help smooth loading states. Use them selectively—prefer SSR prefetch for above-fold content.

## initialData

Seeds the cache if no existing data. Treated as real data; query is considered fresh until it becomes stale.

```tsx
useQuery({
  ...userOptions(),
  initialData: () => getCachedUserFromLocalStorage() ?? undefined,
});
```

Useful when:

- Hydrating client-only page without SSR
- Local persisted snapshot provides acceptable starting point

Avoid using for SSR-prefetched queries (already have real data).

## placeholderData

Temporary value shown until real data resolves; does NOT mark query fresh and is replaced when the fetch completes.

```tsx
useQuery({
  ...statsOptions(),
  placeholderData: { count: 0, delta: 0 },
});
```

Use for:

- Non-critical metrics
- Minimizing layout shift

## Derived Placeholder from Previous

Use previous page's data as placeholder for new page (manual pattern):

```tsx
const prev = queryClient.getQueryData(statsOptions().queryKey);

useQuery({
  ...statsOptions(),
  placeholderData: prev,
});
```

## Avoiding Hard Loading States with initialData

When a new query key triggers (e.g., filtering from 'all' to 'done' todos), a new cache entry creates a hard loading state. You can improve UX by pre-filling with client-side filtering:

```ts
export const useTodosQuery = (state: State) =>
  useQuery({
    queryKey: ['todos', state],
    queryFn: () => fetchTodos(state),
    initialData: () => {
      const allTodos = queryClient.getQueryData<Todos>(['todos', 'all']);
      const filteredData =
        allTodos?.filter((todo) => todo.state === state) ?? [];
      return filteredData.length > 0 ? filteredData : undefined;
    },
  });
```

This shows filtered results from the 'all todos' cache instantly while the background fetch runs, eliminating the spinner for a smoother experience.

## Pagination Smoothness

With `useQuery` pagination (non-infinite) use `keepPreviousData` pattern when switching page numbers:

```tsx
useQuery({
  ...pagedPostsOptions(page),
  placeholderData: (prev) => prev, // acts like keepPreviousData
});
```

## When Not to Use

| Situation                              | Avoid Placeholder                 |
| -------------------------------------- | --------------------------------- |
| Data must indicate loading clearly     | Use Suspense fallback or skeleton |
| Real data required for logic branching | Wait for actual fetch             |
| SSR + loader prefetch                  | Already have real data            |

## Cross-References

- SSR: `./ssr-hydration.md`
- Paginated queries: `./paginated-queries.md`
- Suspense: `./suspense.md`

## Summary

Use `initialData` for client-only bootstrap and `placeholderData` for cosmetic smoothing, not as substitutes for SSR prefetch on critical content.

## Seeding the Cache (Programmatically)

Seed specific queries when you already have data (e.g., from a websocket, post-redirect page):

```ts
queryClient.setQueryData(userOptions(id).queryKey, user);
```

Or seed multiple related queries in a single transition:

```ts
queryClient.setQueryData(postDetailOptions(id).queryKey, post);
queryClient.setQueryData(postCommentsOptions(id).queryKey, comments);
```

Seeding provides instant UI without fetching. Consider a follow-up `invalidateQueries` to reconcile with the server when appropriate.

## Further Reading

- Seeding the Query Cache: <https://tkdodo.eu/blog/seeding-the-query-cache>

## Further Reading

- Placeholder vs Initial Data: <https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query>
