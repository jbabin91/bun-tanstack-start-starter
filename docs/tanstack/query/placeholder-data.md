# Placeholder Data

`placeholderData` is a temporary value shown while the real query result is loading. Unlike `initialData`, it does not mark the query fresh and is replaced once the fetch resolves.

## Example

```tsx
useQuery({
  ...statsOptions(),
  placeholderData: { count: 0, delta: 0 },
});
```

## When to Use

- Cosmetic smoothing to reduce layout shift
- Non-critical panels where showing zeros is acceptable

## Relation to `initialData`

| Feature              | placeholderData               | initialData                      |
| -------------------- | ----------------------------- | -------------------------------- |
| **Level**            | Observer (per-component)      | Cache (shared)                   |
| **Persisted**        | No (fake-it-till-you-make-it) | Yes (real data)                  |
| **Background fetch** | Always triggers               | Respects staleTime               |
| **Flag**             | `isPlaceholderData: true`     | None (data is real)              |
| **When to use**      | Cosmetic UI smoothing         | Prefill from another query/cache |

### Background Refetch Behavior

**placeholderData**: Always triggers background fetch (data is "fake").

**initialData**: Respects `staleTime`. If you set `staleTime: 30s` and provide `initialData`, React Query won't refetch until data is 30s old. Use `initialDataUpdatedAt` to tell Query when the initial data was created:

```ts
const useTodo = (id) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
    staleTime: 30 * 1000,
    initialData: () =>
      queryClient.getQueryData(['todo', 'list'])?.find((t) => t.id === id),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['todo', 'list'])?.dataUpdatedAt,
  });
};
```

Now background refetch respects the list query's age.

### Error Transitions

**placeholderData**: If background fetch fails, you see the error (placeholder is discarded).

**initialData**: If background fetch fails, you keep the `initialData` (it's real cached data). Query goes to error state but `data` remains available (check both `data` and `error`).

See `./initial-data.md` for bootstrap patterns and using previous data as placeholder.

## Cross-References

- Initial data: `./initial-data.md`
- Paginated queries: `./paginated-queries.md`

## Summary

Use `placeholderData` for cosmetic placeholders while a query loads; reserve `initialData` for seeding real cached data without SSR.

## Further Reading

- Placeholder vs Initial Data: <https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query>
