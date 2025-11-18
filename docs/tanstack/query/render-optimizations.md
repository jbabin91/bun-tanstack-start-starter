# Render Optimizations

Reduce unnecessary renders by controlling what changes trigger updates.

## Understanding Re-Renders

React Query triggers re-renders when query meta information changes. Even if your data doesn't change, properties like `isFetching` will cause re-renders during background refetches:

```ts
// Component re-renders twice during background refetch:
{ status: 'success', data: 2, isFetching: true }
{ status: 'success', data: 2, isFetching: false }
```

This is usually fine—unnecessary re-renders are better than missing updates. Only optimize if you have performance issues.

## Structural Sharing

Query caches use structural sharing to preserve referential identity at every level. When data updates, React Query compares old and new states:

```json
// Before
[
  { "id": 1, "name": "Learn React", "status": "active" },
  { "id": 2, "name": "Learn React Query", "status": "todo" }
]

// After (id 1 changed)
[
  { "id": 1, "name": "Learn React", "status": "done" },
  { "id": 2, "name": "Learn React Query", "status": "todo" }
]
```

The object with `id: 2` keeps the same reference—React Query copies it over unchanged. This is crucial for selectors:

```ts
// ✅ Only re-renders if todo with id:2 changes (thanks to structural sharing)
const { data } = useTodo(2);
```

**With `select`**: Structural sharing happens twice—once on the `queryFn` result, once on the `select` result.

**Performance note**: Structural sharing can be expensive on very large datasets. Disable with `structuralSharing: false` if needed. Only works on JSON-serializable data.

## `select` for Slices

Project only needed fields to consumers.

```tsx
const { data: total } = useQuery({
  ...cartOptions(),
  select: (cart) => cart.items.reduce((acc, it) => acc + it.price * it.qty, 0),
});
```

## `notifyOnChangeProps`

Limit which properties trigger re-renders by specifying which fields the component cares about:

```tsx
export const useTodosQuery = (select, notifyOnChangeProps) =>
  useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
    notifyOnChangeProps,
  });

// Only re-renders when data changes (not isFetching)
export const useTodosCount = () =>
  useTodosQuery((data) => data.length, ['data']);
```

**Caveat**: Manually maintaining this list is error-prone. If you add `error` usage but forget to update `notifyOnChangeProps`, your component won't re-render on errors.

### Tracked Queries (Recommended)

Set `notifyOnChangeProps: 'tracked'` (default in v4+) to automatically track which fields you access:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: 'tracked', // Default in v4+
    },
  },
});
```

React Query tracks field access during render and only notifies on changes to those fields. This eliminates manual maintenance.

**Limitations:**

- **Object rest destructuring** tracks all fields:

  ```ts
  // ❌ Tracks everything
  const { isLoading, ...queryInfo } = useQuery(...);

  // ✅ Fine
  const { isLoading, data } = useQuery(...);
  ```

- **Effects**: Only fields accessed during render are tracked. Dependency arrays usually solve this:

  ```ts
  // ❌ Won't track data
  React.useEffect(() => {
    console.log(queryInfo.data);
  });

  // ✅ Tracks data (accessed in dependency array during render)
  React.useEffect(() => {
    console.log(queryInfo.data);
  }, [queryInfo.data]);
  ```

- **No reset**: Once a field is tracked, it's tracked for the observer's lifetime. If you conditionally access `data`, it remains tracked even when the condition is false.

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
