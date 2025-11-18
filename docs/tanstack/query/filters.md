# Filters

Derive filtered views efficiently using `select` or by encoding filter dimensions in query keys.

## Key-Based Filters

Include filter term in key when it affects server result:

```ts
queryKey: ['posts', 'list', filter];
```

## Client-Side Derived Filters

When server result is the same but view differs, use `select` to derive filtered slices:

```tsx
const { data: open } = useQuery({
  ...postsOptions(),
  select: (all) => all.filter((p) => !p.closed),
});
```

### Transformation Options Comparison

Where you transform data matters:

| Location          | Pros                                     | Cons                                      |
| ----------------- | ---------------------------------------- | ----------------------------------------- |
| **Backend**       | No frontend work                         | Not always possible                       |
| **queryFn**       | Close to data source                     | Runs on every fetch; transformed in cache |
| **Render (hook)** | Flexible                                 | Runs on every render (needs useMemo)      |
| **select option** | Best optimization; partial subscriptions | Structural sharing performed twice        |

### Using select for Transformations

The `select` option is optimal for transformations:

```ts
// ❌ Inline function re-runs every render
useQuery({
  ...todosOptions(),
  select: (data) => data.map((todo) => todo.name.toUpperCase()),
});

// ✅ Stable function reference
const transformTodoNames = (data: Todos) =>
  data.map((todo) => todo.name.toUpperCase());

useQuery({
  ...todosOptions(),
  select: transformTodoNames,
});

// ✅ Or memoize with useCallback
useQuery({
  ...todosOptions(),
  select: React.useCallback(
    (data: Todos) => data.map((todo) => todo.name.toUpperCase()),
    [],
  ),
});
```

### Partial Subscriptions with select

`select` enables subscribing to slices of data, reducing re-renders:

```ts
// Custom hook that accepts optional selector
export const useTodosQuery = (select?: (data: Todos) => any) =>
  useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  });

// Subscribe only to count
export const useTodosCount = () => useTodosQuery((data) => data.length);

// Subscribe to specific todo
export const useTodo = (id: number) =>
  useTodosQuery((data) => data.find((todo) => todo.id === id));
```

When a todo's name changes but the count stays the same, `useTodosCount` won't re-render—only the result of the selector matters.

## Avoid Recompute

Memoize predicates or move heavy work into `select` to leverage structural sharing. The `select` option only runs when data changes or the selector function identity changes.

## Cross-References

- Query keys: `./query-keys.md`
- Render optimizations: `./render-optimizations.md`

## Summary

Encode true data differences in keys; prefer `select` for lightweight client-only filters to minimize cache duplication and re-renders.

## Further Reading

- Data Transformations: <https://tkdodo.eu/blog/react-query-data-transformations>
- Selectors Supercharged: <https://tkdodo.eu/blog/react-query-selectors-supercharged>
