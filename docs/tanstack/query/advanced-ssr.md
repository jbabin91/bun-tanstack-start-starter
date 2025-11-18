# Advanced SSR

Advanced server rendering patterns for TanStack Query with Start/Router.

## Streaming Deferred Sections

Render critical data immediately and stream the rest:

```tsx
function Dashboard() {
  const { data: core } = useSuspenseQuery(coreStatsOptions());
  return (
    <>
      <CoreStats data={core} />
      <Suspense fallback={<MiniSpinner />}>
        <DeferredStats />
      </Suspense>
    </>
  );
}
```

## Selective SSR

Combine with Start's selective SSR to skip server rendering for client-only components while still prefetching critical data.

See: `../start/selective-ssr.md`.

## Hydration Stability

Set small positive `staleTime` for above-the-fold queries to avoid immediate background refetch after hydration.

## Error Segmentation

Use multiple Error Boundaries to avoid one failed query breaking the entire page; pair with Suspense for progressive hydration.

## Cross-References

- SSR overview: `./ssr-hydration.md`
- Prefetching: `./prefetching-router.md`
- Suspense: `./suspense.md`

## Summary

Stream non-critical sections, combine selective SSR rules with query prefetch, and structure boundaries for resilient hydration.
