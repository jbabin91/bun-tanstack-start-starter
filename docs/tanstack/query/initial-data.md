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

## Seeding Detail Caches from Lists

When navigating from list \u2192 detail view, seed the detail cache from the list to eliminate loading states.

### Pull Approach (Lazy Seeding)

When detail query runs, look up the list cache:

```ts
export const useTodo = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['todos', 'detail', id],
    queryFn: () => fetchTodo(id),
    initialData: () => {
      // Look up list cache for the item
      return queryClient
        .getQueryData<Todo[]>(['todos', 'list'])
        ?.find((todo) => todo.id === id);
    },
    initialDataUpdatedAt: () =>
      // Tell Query when list was fetched for correct staleness
      queryClient.getQueryState(['todos', 'list'])?.dataUpdatedAt,
  });
};
```

**Pros**: Seeds cache just-in-time when needed
**Cons**: Requires `initialDataUpdatedAt` to respect `staleTime`

### Push Approach (Eager Seeding)

When list is fetched, immediately create detail caches:

```ts
export const useTodos = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['todos', 'list'],
    queryFn: async () => {
      const todos = await fetchTodos();
      todos.forEach((todo) => {
        // Create detail cache for each item
        queryClient.setQueryData(['todos', 'detail', todo.id], todo);
      });
      return todos;
    },
  });
};
```

**Pros**: Staleness automatically tracked
**Cons**: Creates many inactive cache entries that might be garbage collected before use (after `gcTime`)

### When to Seed from Lists

- List and detail structures are compatible (same shape or assignable)
- List is fresh (< `staleTime`)
- Detail view is frequently accessed after list view
- For incompatible shapes, use `placeholderData` instead of `initialData`

## Prefetching to Avoid Waterfalls

Start fetches early before components render:

```ts
// Route-level prefetch (best)
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions());
  },
});

// Bundle-level prefetch (code-splitting)
queryClient.prefetchQuery(postsOptions()); // Runs when bundle evaluated

// Intent-based prefetch
<Link
  to="/posts"
  onPointerEnter={() => queryClient.prefetchQuery(postsOptions())}
/>;
```

**Suspense waterfalls**: Multiple `useSuspenseQuery` in one component suspend sequentially. Fix by:

1. One query per component
2. Prefetch all queries before component renders
3. Use `useSuspenseQueries` to trigger parallel fetches

## Cross-References

- SSR: `./ssr-hydration.md`
- Paginated queries: `./paginated-queries.md`
- Suspense: `./suspense.md`
- Prefetching: `./prefetching-router.md`

## Summary

Use `initialData` for client-only bootstrap and seeding from other caches. Use `placeholderData` for cosmetic smoothing. Prefetch early to avoid waterfalls. Seed detail caches from lists for instant navigation.

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
