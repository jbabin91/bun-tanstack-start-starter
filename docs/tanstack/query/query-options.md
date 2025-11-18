# Query Options Factory Pattern

Using `queryOptions` factories standardizes query configuration, promotes type safety, and makes reuse trivial across loaders, components, mutations, and tests.

## Why Factories?

Without factories, each useQuery call re-specifies keys, functions, and defaults—easy to drift or duplicate. Factories:

- Centralize queryKey & queryFn definitions
- Make refactors (key changes, staleTime tweaks) one-line updates
- Improve type inference (queryOptions preserves narrow return types)
- Enable easy reuse in Router loaders (`prefetchQuery`) and components (`useSuspenseQuery`)
- Provide a discoverable API surface (namespace-style grouping)

## Hierarchical Key + Factory Example

Inspired by community best practices (see External Resources) for scalable patterns:

```ts
// src/lib/query-options/todos.ts
import { queryOptions } from '@tanstack/react-query';
import { fetchTodos, fetchTodo } from '@/server/todos';

export const todoQueries = {
  all: () => ['todos'] as const,
  lists: () => [...todoQueries.all(), 'list'] as const,
  list: (filters: string) =>
    queryOptions({
      queryKey: [...todoQueries.lists(), filters],
      queryFn: () => fetchTodos(filters),
    }),
  details: () => [...todoQueries.all(), 'detail'] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...todoQueries.details(), id],
      queryFn: () => fetchTodo(id),
      staleTime: 5_000,
    }),
};
```

### Benefits

- Keys compose predictably (`['todos','detail',42]`)
- `as const` keeps tuple literal types (narrow key inference)
- Each factory returns a complete options object for any consumption site

## Usage Across the Stack

### Component (Suspense)

```tsx
function TodoDetail({ id }: { id: number }) {
  const { data } = useSuspenseQuery(todoQueries.detail(id));
  return <TodoView todo={data} />;
}
```

### Router Loader Prefetch

```ts
export const Route = createFileRoute('/todos/$id')({
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.prefetchQuery(todoQueries.detail(Number(params.id)));
  },
  component: TodoDetailPage,
});
```

### Parallel Queries

```ts
const results = useSuspenseQueries({
  queries: [todoQueries.list('open'), todoQueries.list('closed')],
});
```

### Mutation Invalidation

```ts
const queryClient = useQueryClient();

const createTodo = useMutation({
  mutationFn: createTodoFn,
  onSuccess: () => {
    // Invalidate all lists sharing prefix
    queryClient.invalidateQueries({
      queryKey: todoQueries.lists(),
      exact: false,
    });
  },
});
```

For more targeted updates prefer `setQueryData`:

```ts
onSuccess: (newTodo) => {
  queryClient.setQueryData(
    todoQueries.list('open').queryKey,
    (prev: Todo[] | undefined) => (prev ? [newTodo, ...prev] : [newTodo]),
  );
};
```

## Pattern: Namespace + Options

Group related factories under a namespace object (`todoQueries`). Guidelines:

| Guideline                                      | Reason                                   |
| ---------------------------------------------- | ---------------------------------------- |
| Provide a base `all()` key                     | Single source of truth for base prefix   |
| Derive sub-scope helpers (`lists`, `details`)  | Consistent hierarchical composition      |
| Return `queryOptions` from leaf functions      | Immediate consumption with any Query API |
| Use `as const` on key arrays                   | Preserve literal tuple types             |
| Keep key segments semantic (`detail`, not `d`) | Debuggability & tooling                  |

## Pattern: Validation + Type Safety

When route params or search params feed factories, validate first:

```ts
const Route = createFileRoute('/todos/')({
  validateSearch: z.object({ filter: z.string().default('open') }),
  component: TodosPage,
})

function TodosPage() {
  const { filter } = Route.useSearch()
  const { data } = useSuspenseQuery(todoQueries.list(filter))
  return <TodoList todos={data} />
}
```

## Pattern: Derived Factories

Compose factories rather than duplicating logic:

```ts
export const todoQueries = {
  all: () => ['todos'] as const,
  search: (term: string) =>
    queryOptions({
      queryKey: [...todoQueries.all(), 'search', term],
      queryFn: () => fetchTodos(term),
    }),
  infinite: (term: string) => ({
    queryKey: [...todoQueries.search(term).queryKey, 'infinite'] as const,
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      fetchTodos(term, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }),
};
```

## Loader Integration Checklist

- Use `prefetchQuery(factory())` in loader
- Pair with `useSuspenseQuery(factory())` in component
- Prefer factories over manual duplication of queryKey & queryFn
- Avoid mixing raw keys (`['todos']`) and factory keys—standardize

## Testing Factories

```ts
// unit test example
it('builds detail key correctly', () => {
  expect(todoQueries.detail(7).queryKey).toEqual(['todos', 'detail', 7]);
});
```

## Anti-Patterns

| Anti-pattern                                 | Fix                               |
| -------------------------------------------- | --------------------------------- |
| Hardcoding keys in components                | Use factory leaf function         |
| Repeating options (staleTime) across files   | Centralize in factory             |
| Mutations invalidating overly broad prefixes | Invalidate specific sub-scope     |
| Using `as any` to coerce tuple types         | Use `as const` + proper inference |

## Cross-References

- Suspense integration: `./suspense.md`
- Mutations & invalidation: `./mutations.md`
- Infinite queries built from factories: `./infinite-queries.md`
- Query keys conventions: `./query-keys.md`

## External Resources

- The Query Options API (blog): [https://tkdodo.eu/blog/the-query-options-api](https://tkdodo.eu/blog/the-query-options-api)
- Official: Query Options — <https://tanstack.com/query/latest/docs/framework/react/reference/useQuery>

## TypeScript Tips

- Prefer inference via factories. Use `as const` on array keys to keep tuple types narrow.
- Validate shapes without widening using `satisfies`:

```ts
const key = ['posts', 'detail', id] as const;
const options = {
  queryKey: key,
  queryFn: () => getPostFn(id),
} satisfies Parameters<typeof queryClient.prefetchQuery>[0];
```

- Extract types from factories with `ReturnType` when composing:

```ts
type PostDetailOptions = ReturnType<typeof postDetailOptions>;
```

Further Reading: <https://tkdodo.eu/blog/type-safe-react-query>

## Summary

Use hierarchical factory namespaces returning `queryOptions` to ensure consistent, type-safe, and easily reusable queries across loaders, components, parallel querying, mutations, and tests.
