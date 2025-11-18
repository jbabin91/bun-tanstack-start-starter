# Background Fetching Indicators

Differentiate between initial load and background refresh.

## isLoading vs isFetching

- `isLoading`: No data yet, initial request in flight
- `isFetching`: Any request in flight (including background refetch)

```tsx
const { data, isLoading, isFetching } = useQuery(postsOptions());
if (isLoading) return <Skeleton />;
return (
  <>
    {isFetching && <Spinner size="xs" />}
    <PostsList posts={data} />
  </>
);
```

## Global Indicator

```tsx
const isFetching = useIsFetching();
return isFetching ? <TopBarSpinner /> : null;
```

## Cross-References

- Queries: `./queries.md`
- Render optimizations: `./render-optimizations.md`

## Summary

Use `isLoading` for first render and `isFetching` for background refresh cues to avoid jarring full-page spinners.
