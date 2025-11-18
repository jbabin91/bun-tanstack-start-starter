# Paginated Queries

Use standard `useQuery` for numbered page navigation with `placeholderData` to keep previous results visible while fetching.

## Core Pattern

```tsx
export function pagedPostsOptions(page: number) {
  return queryOptions({
    queryKey: ['posts', 'page', page],
    queryFn: () => getPostsPageFn(page),
    keepPreviousData: true, // alias pattern using placeholderData below
  });
}

function PagedPosts({ page }: { page: number }) {
  const { data, isFetching } = useQuery({
    ...pagedPostsOptions(page),
    placeholderData: (prev) => prev, // acts like keepPreviousData
  });
  return (
    <>
      {isFetching && <Spinner size="xs" />}
      <PostsList posts={data?.items ?? []} />
      <Pager current={page} totalPages={data?.totalPages ?? 1} />
    </>
  );
}
```

## Search Params Integration

```ts
export const Route = createFileRoute('/posts/')({
  validateSearch: z.object({ page: z.coerce.number().int().min(1).default(1) }),
  component: PostsPage,
})

function PostsPage() {
  const { page } = Route.useSearch()
  return <PagedPosts page={page} />
}
```

## Cache Strategy

- Include page number in key: `['posts','page', page]`
- Consider `staleTime` for quickly revisiting pages
- Use `prefetchQuery` for next page on idle time

```ts
useEffect(() => {
  queryClient.prefetchQuery(pagedPostsOptions(page + 1));
}, [page]);
```

## Anti-Patterns

| Anti-pattern                                    | Fix                                    |
| ----------------------------------------------- | -------------------------------------- |
| Using `useInfiniteQuery` for classic pagination | Use `useQuery` with page param         |
| Dropping previous data on page switch           | Use `placeholderData: prev => prev`    |
| Not including page in key                       | Include page to avoid cache collisions |

## Cross-References

- Infinite queries: `./infinite-queries.md`
- Initial & placeholder data: `./initial-data.md`
- Prefetching: `./prefetching-router.md`

## Summary

For numbered pagination, compose keys with the page param, carry previous data across transitions with placeholderData, and optionally prefetch the next page for snappy UX.
