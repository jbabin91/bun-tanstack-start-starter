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

## Summary

Structure infinite queries around stable factory keys, control memory with `maxPages`, integrate filters via search params, and favor targeted page edits over broad invalidation.
