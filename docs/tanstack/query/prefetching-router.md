# Prefetching & Router Integration

Route-aware prefetching improves perceived performance by loading data before navigation completes.

## Loader Prefetch (Baseline)

Standard SSR + client navigation pattern:

```ts
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions());
  },
  component: PostsPage,
});
```

## Intent-Based Prefetch (Hover, Focus, Visible)

Prefetch when user signals intent:

```tsx
function NavPostLink() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <Link
      to="/posts"
      onPointerEnter={() => queryClient.prefetchQuery(postsOptions())}
      onFocus={() => queryClient.prefetchQuery(postsOptions())}
    >
      Posts
    </Link>
  );
}
```

Intersection prefetch for cards:

```tsx
function PostCard({ id }: { id: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        queryClient.prefetchQuery(postOptions(id));
        observer.disconnect();
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id, queryClient]);

  return <div ref={ref}>/* preview */</div>;
}
```

## Prefetch vs useQuery on Listing Pages

Listing page that links to detail items can prefetch detail queries on hover for instant transitions later.

## Parallel Prefetch

Avoid waterfall by prefetching all essential queries concurrently:

```ts
await Promise.all([
  queryClient.prefetchQuery(postsOptions()),
  queryClient.prefetchQuery(userOptions()),
  queryClient.prefetchQuery(notificationsOptions()),
]);
```

## Conditional Prefetch

Skip prefetch if data already fresh:

```ts
const opts = postsOptions();
if (!queryClient.getQueryState(opts.queryKey)?.dataUpdatedAt) {
  await queryClient.prefetchQuery(opts);
}
```

Or check staleness:

```ts
const state = queryClient.getQueryState(opts.queryKey);
if (!state || state.isInvalidated || state.fetchStatus === 'idle') {
  await queryClient.prefetchQuery(opts);
}
```

## Navigation Blocking vs Prefetch

Do not block navigation waiting for non-critical prefetch. Prefetch opportunistically; let component Suspense boundary handle slower queries.

## Cache Warming Script (Optional)

Background warming after auth/login:

```ts
async function warmAuthenticatedCache(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery(userOptions()),
    queryClient.prefetchQuery(settingsOptions()),
    queryClient.prefetchQuery(notificationsOptions()),
  ]);
}
```

Invoke after successful login mutation.

## Anti-Patterns

| Anti-pattern                                            | Fix                                  |
| ------------------------------------------------------- | ------------------------------------ |
| Prefetching every linked detail on a large list         | Limit to visible or hovered items    |
| Sequential prefetch causing delay                       | Use `Promise.all`                    |
| Prefetching when data already fresh                     | Check cache state before prefetch    |
| Blocking navigation until all optional queries complete | Defer optional queries; use Suspense |

## Cross-References

- Suspense: `./suspense.md`
- SSR & Hydration: `./ssr-hydration.md`
- Query factories: `./query-options.md`

## Summary

Use prefetching to reduce perceived latency: loader prefetch for critical route data, intent or visibility prefetch for contextual detail data, and parallel prefetching to avoid waterfalls. Always check freshness to avoid redundant work.
