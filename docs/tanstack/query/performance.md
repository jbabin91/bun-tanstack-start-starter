# Performance

Design queries to avoid waterfalls and unnecessary re-renders.

## Avoid Request Waterfalls

- Prefetch in loaders using `Promise.all`
- Group parallel queries with `useSuspenseQueries`
- Only chain when dependency exists (use `enabled`)

## Use `select` for Derived Data

```tsx
const { data: summary } = useQuery({
  ...statsOptions(),
  select: (raw) => ({
    total: raw.items.length,
    open: raw.items.filter((i) => !i.closed).length,
  }),
});
```

`select` prevents downstream renders when irrelevant fields change due to structural sharing.

## Control Staleness

Set `staleTime` appropriate to data volatility to reduce background refetching churn.

## Prefetch Strategically

- On hover/focus for detail pages
- Intersection observer for cards in viewport
- Warm caches after login

## Split Boundaries

Use multiple Suspense/Error boundaries to isolate slow or failure-prone sections.

## Memoize Expensive Lists

Render lists with stable keys and memoized items. Keep transformations in `select` instead of map/filter in render.

## Cache Size Management

- Use `gcTime` to limit retention
- For infinite queries, set `maxPages`

## Anti-Patterns

| Anti-pattern                              | Fix                    |
| ----------------------------------------- | ---------------------- |
| Serial awaiting in loaders                | `Promise.all` prefetch |
| Mapping large arrays in render repeatedly | Move to `select`       |
| Very low `staleTime` on stable data       | Increase `staleTime`   |
| Single global Suspense boundary           | Split per-section      |

## Cross-References

- Render optimizations: `./render-optimizations.md`
- Prefetching: `./prefetching-router.md`
- Suspense: `./suspense.md`

## Summary

Push work earlier via prefetching, reduce render churn with `select` and structural sharing, and tune staleness and cache limits to match data volatility.
