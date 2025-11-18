# Render Optimizations

Reduce unnecessary renders by controlling what changes trigger updates.

## Structural Sharing

Query caches use structural sharing to minimize object identity changes. Prefer immutable updates in `setQueryData` and avoid deep cloning unless needed.

## `select` for Slices

Project only needed fields to consumers.

```tsx
const { data: total } = useQuery({
  ...cartOptions(),
  select: (cart) => cart.items.reduce((acc, it) => acc + it.price * it.qty, 0),
});
```

## `notifyOnChangeProps`

Limit which properties trigger re-renders.

```tsx
const result = useQuery({
  ...heavyOptions(),
  notifyOnChangeProps: ['data', 'isFetching'],
});
```

## Stable Callbacks and Props

Wrap callbacks with `useCallback` and props with `useMemo` when passing to deep trees.

## Split Components

Isolate read-heavy sections into smaller components that subscribe to different queries to avoid wide re-rendering.

## Avoid Derived Work in Render

Move sorting/filtering to `select` or memoized selectors instead of computing on every render.

## Anti-Patterns

| Anti-pattern                            | Fix                                           |
| --------------------------------------- | --------------------------------------------- |
| Passing entire objects to many children | Pass minimal primitives or memoized selectors |
| Recomputing derived values in render    | Use `select` or memoize                       |
| Editing cached data in place            | Use immutable updates                         |

## Cross-References

- Performance: `./performance.md`
- Queries: `./queries.md`

## Summary

Limit update signals, project only necessary data, and isolate subscription boundaries to keep render costs predictable and small.

## Further Reading

- Render Optimizations: <https://tkdodo.eu/blog/react-query-render-optimizations>
