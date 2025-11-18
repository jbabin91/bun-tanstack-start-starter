# Infinite Queries

Use `useInfiniteQuery` for cursor or page-based loading where users incrementally reveal more data.

## Core Pattern (Cursor-Based)

```ts
export const todoQueries = {
  all: () => ['todos'] as const,
  infinite: (filter: string) => ({
    queryKey: [...todoQueries.all(), 'infinite', filter] as const,
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchTodos({ filter, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }),
};
```

```tsx
function InfiniteTodos({ filter }: { filter: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(todoQueries.infinite(filter));

  return (
    <>
      {data.pages
        .flatMap((p) => p.items)
        .map((t) => (
          <TodoItem key={t.id} todo={t} />
        ))}
      <button
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? 'Loading…' : hasNextPage ? 'Load more' : 'End'}
      </button>
    </>
  );
}
```

## Search Params Integration (Shareable Pagination State)

Persist cursor or filter in Router search params for back-button and shareable URLs.

```ts
export const Route = createFileRoute('/todos/')({
  validateSearch: z.object({ filter: z.string().default('open') }),
  component: TodosPage,
})

function TodosPage() {
  const { filter } = Route.useSearch()
  return <InfiniteTodos filter={filter} />
}
```

Avoid storing internal cursor in search params (too granular); store filters & view modes.

## Bidirectional Pagination

```ts
useInfiniteQuery({
  queryKey: ['messages'],
  queryFn: ({ pageParam }) => fetchMessages(pageParam),
  initialPageParam: undefined,
  getNextPageParam: (last) => last.nextCursor,
  getPreviousPageParam: (first) => first.prevCursor,
});
```

UI can expose "Load Newer" and "Load Older" buttons.

## Scroll-Based Loading

Use intersection observer:

```tsx
const sentinelRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!sentinelRef.current) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

## Memory Control

Limit retained pages:

```ts
useInfiniteQuery({
  ...todoQueries.infinite(filter),
  maxPages: 10, // drops oldest page data beyond this count
});
```

## Cache Updates After Mutation

Append new item only to first page or all pages based on semantics:

```ts
onSuccess: (created) => {
  queryClient.setQueryData(
    todoQueries.infinite(filter).queryKey,
    (prev: InfiniteData<TodoPage> | undefined) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((p, i) =>
          i === 0 ? { ...p, items: [created, ...p.items] } : p,
        ),
      };
    },
  );
};
```

## Refetch Strategy

Refetch entire infinite query sparingly; prefer targeted edits. To refresh only first page:

```ts
queryClient.invalidateQueries({
  queryKey: todoQueries.infinite(filter).queryKey,
  refetchType: 'active',
});
```

## Optimistic Page Injection

```ts
onMutate: async (newText) => {
  await queryClient.cancelQueries({
    queryKey: todoQueries.infinite(filter).queryKey,
  });
  const previous = queryClient.getQueryData<InfiniteData<TodoPage>>(
    todoQueries.infinite(filter).queryKey,
  );
  const optimistic: Todo = { id: -Date.now(), text: newText, completed: false };
  queryClient.setQueryData(
    todoQueries.infinite(filter).queryKey,
    (prev) =>
      prev && {
        ...prev,
        pages: prev.pages.map((p, i) =>
          i === 0 ? { ...p, items: [optimistic, ...p.items] } : p,
        ),
      },
  );
  return { previous };
};
```

## Anti-Patterns

| Anti-pattern                                                  | Fix                                        |
| ------------------------------------------------------------- | ------------------------------------------ |
| Storing every cursor hop in URL                               | Only store filter, not internal cursors    |
| Invalidating infinite query on every mutation                 | Targeted `setQueryData` page edits         |
| Unbounded page growth                                         | Use `maxPages`                             |
| Flattening pages then losing page boundaries for update logic | Keep structure and flatten only for render |

## Cross-References

- Paginated queries: `./paginated-queries.md`
- Query factories: `./query-options.md`
- Mutations cache edits: `./mutations.md`

## How Infinite Queries Work (Architecture)

### Query & Retryer Architecture

Every query in the cache is an instance of the `Query` class. It manages state and holds the promise for the current fetch. The query delegates actual fetching to a `retryer`:

```ts
class Query() {
  fetch() {
    if (this.state.fetchStatus === 'idle') {
      this.#dispatch({ type: 'fetch' })
      this.#retryer = createRetryer({
        fetchFn: this.options.behavior.onFetch(
          this.context,
          this.options.queryFn
        ),
        retry: this.options.retry,
        retryDelay: this.options.retryDelay
      })
      return this.#retryer.start()
    }

    return this.#retryer.promise
  }
}
```

**Key insight:** The retryer may call `fetchFn` multiple times during retries. This is critical for understanding infinite query behavior.

### QueryBehavior Abstraction

Infinite queries differ from single queries via the `infiniteQueryBehavior` attached to them:

```ts
function infiniteQueryBehavior() {
  return {
    onFetch: (context, queryFn) => {
      const remainingPages = context.data.length;
      let currentPage = 0;
      const result = { pages: [] };

      return async function fetchFn() {
        if (context.direction === 'forward') {
          return [...context.data, await fetchNextPage(queryFn)];
        }
        if (context.direction === 'backward') {
          return [await fetchPreviousPage(queryFn), ...context.data];
        }

        // Refetch: loop through all pages
        do {
          const param = getNextPageParam(result);
          if (param == null) break;
          result.pages.push(await fetchNextPage(queryFn, param));
          currentPage++;
        } while (currentPage < remainingPages);

        return result;
      };
    },
  };
}
```

When you call `fetchNextPage`, it invokes `queryFn` once. During a refetch, it loops through all pages to ensure consistency.

### The Retry Loop Issue

Before v5.56.0, if a middle page failed during a refetch, the retryer would restart the entire loop:

```text
1. Fetch page 1 ✅
2. Fetch page 2 ✅
3. Fetch page 3 ❌ (fails, retry)
4. Retry: Fetch page 1 again ✅
5. Retry: Fetch page 2 again ✅
6. Retry: Fetch page 3 again ❌ (fails, retry)
```

With rate limiting, this could mean never successfully fetching all pages.

### The Fix: Closure-Based State

The fix hoists loop state out of the `fetchFn` so it persists across retries:

```ts
function infiniteQueryBehavior() {
  return {
    onFetch: (context, queryFn) => {
      // ✅ Hoisted: survives retry invocations
      const remainingPages = context.data.length;
      let currentPage = 0;
      const result = { pages: [] };

      return async function fetchFn() {
        // Loop continues from currentPage, not from 0
        do {
          const param = getNextPageParam(result);
          if (param == null) break;
          result.pages.push(await fetchNextPage(queryFn, param));
          currentPage++;
        } while (currentPage < remainingPages);

        return result;
      };
    },
  };
}
```

Now when a page fails and the retryer calls `fetchFn` again, it remembers `currentPage` and `result`, so it continues where it left off instead of restarting.

**Implication:** `retry: 3` means 3 retries total across all pages, not per page. This is consistent with single query behavior.

### No Separate InfiniteQuery Class

Infinite queries don't have a separate class in the cache. The `Query` class handles both single and infinite queries. The only difference is the `behavior` attached to it:

```ts
fetchInfiniteQuery(options) {
  return this.fetchQuery({
    ...options,
    behavior: infiniteQueryBehavior()
  })
}
```

This elegant design means infinite queries benefit from all the same caching, revalidation, and subscription logic as single queries.

## Summary

Structure infinite queries around stable factory keys, control memory with `maxPages`, integrate filters via search params, and favor targeted page edits over broad invalidation. Understand that Query/retryer architecture means retries apply to the whole fetch operation, not individual pages.

## Further Reading

- How Infinite Queries Work: <https://tkdodo.eu/blog/how-infinite-queries-work>
