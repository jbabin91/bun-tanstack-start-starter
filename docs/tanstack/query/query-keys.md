# Query Keys

Query keys uniquely identify cached data. Use structured array keys for clarity, scalability, and partial invalidation.

## Structure Guidelines

| Guideline                            | Rationale                              |
| ------------------------------------ | -------------------------------------- |
| Array keys (`['posts','detail',id]`) | Natural hierarchy + segment inspection |
| Semantic segments ("detail" not "d") | Debuggability & tooling filters        |
| Stable ordering                      | Prevent accidental duplication         |
| Primitive serializable values        | Deterministic identity                 |
| Avoid embedding complex objects      | Hard to compare, memory heavy          |

## Hierarchical Example

```ts
export const postQueries = {
  all: () => ['posts'] as const,
  lists: () => [...postQueries.all(), 'list'] as const,
  list: (filter: string) => [...postQueries.lists(), filter] as const,
  details: () => [...postQueries.all(), 'detail'] as const,
  detail: (id: number) => [...postQueries.details(), id] as const,
};
```

Factories (see `query-options.md`) wrap these keys in `queryOptions` for consumption.

## Key Consistency

Use identical factory for loader prefetch and component consumption.

```ts
await queryClient.prefetchQuery(postDetailOptions(id));
// later
const { data } = useSuspenseQuery(postDetailOptions(id));
```

If keys differ (`['posts','detail','42']` vs `['posts','detail',42]`) they are treated as separate queries.

## Parameter Inclusion

Include all parameters that affect returned data:

```ts
['posts', 'list', filter, page, sort];
```

If sort changes but key excludes it, stale data persists incorrectly.

### Treat Query Key Like a Dependency Array

Think of the query key like `useEffect`'s dependency array: when the key changes, React Query automatically refetches. Include any variable that your `queryFn` depends on:

```ts
export const useTodosQuery = (state: 'all' | 'open' | 'done') =>
  useQuery({
    queryKey: ['todos', state],
    queryFn: () => fetchTodos(state),
  });
```

When `state` changes in your UI, the query key changes, triggering a refetch—no manual `useEffect` orchestration needed. This keeps your filter selection in sync with the query function automatically.

## Conditional Segments

Avoid optional trailing `undefined` by explicitly handling condition:

```ts
const userId = maybeUserId ?? 'anonymous'[('profile', 'detail', userId)];
```

## Invalidation Leverage

Invalidating `['posts','list']` affects all lists:

```ts
queryClient.invalidateQueries({ queryKey: postQueries.lists() });
```

Invalidating root affects entire domain:

```ts
queryClient.invalidateQueries({ queryKey: postQueries.all() });
```

## Composite + Search Params

Include search params in keys when they alter data shape or filters. Validate first for type safety:

```ts
const { filter, sort } = Route.useSearch();
const key = ['posts', 'list', filter, sort] as const;
```

## Key Debugging

Use devtools or log keys sparingly (avoid production noise). For inspection:

```ts
for (const q of queryClient.getQueryCache().findAll()) {
  console.debug(q.queryKey);
}
```

(Reserve for diagnostics only.)

## Colocate Keys with Queries

Keep query keys and query functions together in feature directories, not in a global `/utils/queryKeys.ts`. Colocate for maintainability:

```text
src/
  features/
    Profile/
      index.tsx
      queries.ts    # Keys, factories, hooks here
    Todos/
      index.tsx
      queries.ts
```

Export custom hooks from `queries.ts`; keep keys and query functions private to the module.

## Query Key Factories

Avoid manual key duplication—use factory objects:

```ts
const todoKeys = {
  all: () => ['todos'] as const,
  lists: () => [...todoKeys.all(), 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all(), 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};

// Usage
queryClient.removeQueries({ queryKey: todoKeys.all() }); // Remove all todos
queryClient.invalidateQueries({ queryKey: todoKeys.lists() }); // Invalidate all lists
queryClient.prefetchQuery({
  queryKey: todoKeys.detail(id),
  queryFn: () => fetchTodo(id),
});
```

Each level builds on the previous, enabling flexible invalidation at any granularity.

## Queries are Declarative

Don't pass parameters to `refetch`—change the query key instead:

```tsx
// ❌ Trying to pass params to refetch
function Component() {
  const { data, refetch } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });
  return <Filters onApply={() => refetch(???)} />; // How to pass filters?
}

// ✅ Let the key drive the query
function Component() {
  const [filters, setFilters] = React.useState();
  const { data } = useQuery({
    queryKey: ['todos', filters],
    queryFn: () => fetchTodos(filters),
  });
  return <Filters onApply={setFilters} />; // State change triggers refetch
}
```

When `filters` changes, the key changes, and React Query automatically refetches. No manual `refetch` orchestration needed.

## Anti-Patterns

| Anti-pattern                            | Fix                                        |
| --------------------------------------- | ------------------------------------------ |
| Joined string key (`'posts:detail:42'`) | Use array segments for easier invalidation |
| Omitting filter from key                | Include every filter dimension             |
| Passing non-serializable objects        | Extract primitives (ids, strings)          |
| Duplicating factory logic inline        | Centralize in namespace factories          |
| Global `/utils/queryKeys.ts`            | Colocate keys with features                |
| Trying to pass params to `refetch`      | Change query key instead                   |

## Cross-References

- Factories: `./query-options.md`
- Invalidation: `./query-invalidation.md`
- Paginated queries: `./paginated-queries.md`

## Summary

Design array keys that encode all data-impacting parameters. Use hierarchical prefixes for targeted invalidation and keep semantics clear to reduce maintenance friction.

## Further Reading

- Effective React Query Keys: <https://tkdodo.eu/blog/effective-react-query-keys>
