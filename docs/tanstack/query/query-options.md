# Query Options Factory Pattern

Using `queryOptions` factories standardizes query configuration, promotes type safety, and makes reuse trivial across loaders, components, mutations, and tests.

## Why Factories?

Without factories, each useQuery call re-specifies keys, functions, and defaults—easy to drift or duplicate. Factories:

- Centralize queryKey & queryFn definitions
- Make refactors (key changes, staleTime tweaks) one-line updates
- Improve type inference (queryOptions preserves narrow return types)
- Enable easy reuse in Router loaders (`prefetchQuery`) and components (`useSuspenseQuery`)
- Provide a discoverable API surface (namespace-style grouping)

## The queryOptions Helper: Type Safety & Inference

The `queryOptions` helper from `@tanstack/react-query` provides critical type safety benefits:

**Without queryOptions:**

```ts
const userQuery = {
  queryKey: ['user', id],
  queryFn: () => getUserFn(id),
};

// Type inference lost
const { data } = useQuery(userQuery); // data: unknown
```

**With queryOptions:**

```ts
const userQuery = queryOptions({
  queryKey: ['user', id],
  queryFn: () => getUserFn(id),
});

// Type inference preserved
const { data } = useQuery(userQuery); // data: User
```

**How it works:** `queryOptions` attaches a hidden `Symbol` (called `dataTag`) to the options object that preserves the return type of `queryFn`. When you pass these options to `useQuery`, TypeScript infers the correct data type.

**Benefits:**

- Full type safety without explicit generics
- Works across loaders, components, tests
- No need for `<User>` generics on `useQuery`
- Single source of truth for query structure

## Type-Safe Patterns

### Trust Your Types

Type safety requires trust. If you can't rely on types being accurate, they become mere suggestions. Common pitfalls:

```ts
// ❌ Return-only generic (type assertion in disguise)
const fetchTodo = async (id: number) => {
  const response = await axios.get<Todo>(`/todos/${id}`);
  return response.data;
};
```

This violates the **Golden Rule of Generics:**

**For a generic to be useful, it must appear at least twice.**

The `axios.get` signature:

```ts
function get<T = any>(url: string): Promise<{ data: T; status: number }>;
```

`T` only appears in the return type—it's a lie. You could write:

```ts
const response = await axios.get(`/todos/${id}`);
return response.data as Todo;
```

At least the type assertion is explicit.

### Validate with Zod

Runtime validation provides real type safety:

```ts
import { z } from 'zod';

// ✅ Define schema
const todoSchema = z.object({
  id: z.number(),
  name: z.string(),
  done: z.boolean(),
});

const fetchTodo = async (id: number) => {
  const response = await axios.get(`/todos/${id}`);
  // ✅ Parse against schema
  return todoSchema.parse(response.data);
};

const query = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetchTodo(id),
});
```

**Benefits:**

- Types inferred from schema (no separate type definition)
- Validation throws descriptive errors (query goes to `error` state)
- No "cannot read property X of undefined" surprises
- Schema is resilient (use `.optional()`, `.nullable()` where appropriate)

**Tradeoffs:**

- Runtime overhead (parsing cost)
- Not every field mismatch should fail the query
- Applies best to critical data, not every endpoint

### Infer, Don't Assert

The more your TypeScript looks like JavaScript, the better:

```ts
// ❌ Explicit generics
const query = useQuery<Todo>({
  queryKey: ['todos', id],
  queryFn: () => fetchTodo(id),
});

// ✅ Infer from queryFn
const query = useQuery({
  queryKey: ['todos', id],
  queryFn: () => fetchTodo(id), // fetchTodo returns Promise<Todo>
});
```

Type inference "flows" through your code. No angle brackets needed.

### getQueryData Caveat

`queryClient.getQueryData` has a return-only generic:

```ts
const todo = queryClient.getQueryData(['todos', 1]);
//    ^? const todo: unknown

const todo = queryClient.getQueryData<Todo>(['todos', 1]);
//    ^? const todo: Todo | undefined
```

This is unavoidable—the QueryCache has no up-front schema. Tools like [react-query-kit](https://github.com/liaoliao666/react-query-kit) help by wrapping `getQueryData` with type-safe accessors.

**v5 improvement:** Use `queryOptions` to make `getQueryData` type-safe:

```ts
const todoOptions = (id: number) =>
  queryOptions({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(id),
  });

const todo = queryClient.getQueryData(todoOptions(1).queryKey);
//    ^? const todo: Todo | undefined ✅
```

### End-to-End Type Safety

For monorepos with shared frontend/backend:

- **[tRPC](https://trpc.io/)**: Infer types from backend router
- **[zodios](https://www.zodios.org/)**: Define API schema with zod

Both build on React Query and eliminate the "trusted boundary" by defining types/schemas upfront.

### Why Separating queryKey from queryFn Was a Mistake

Early patterns advocated splitting keys and functions:

```ts
// ❌ Old pattern: separated keys and functions
export const userKeys = {
  all: () => ['user'] as const,
  detail: (id: number) => [...userKeys.all(), id] as const,
};

export const userQueries = {
  detail: (id: number) => getUserFn(id),
};

// Usage: manual composition
useQuery({
  queryKey: userKeys.detail(id),
  queryFn: () => userQueries.detail(id),
});
```

**Problems:**

- Keys and functions drift apart (easy to mismatch parameters)
- Two imports required (`userKeys` + `userQueries`)
- Type inference breaks (no `dataTag` connection)
- Verbose at call sites

**Modern pattern: unified factories with queryOptions:**

```ts
// ✅ Unified pattern
export const userQueries = {
  all: () => ['user'] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...userQueries.all(), id],
      queryFn: () => getUserFn(id),
    }),
};

// Usage: single import, full type safety
const { data } = useQuery(userQueries.detail(id)); // data: User
```

**Advantages:**

- Key and function always stay together (impossible to mismatch)
- Single import
- Full type inference via `dataTag`
- Cleaner call sites
- Easier refactoring (change in one place)

**Lesson:** Combine keys with functions in the same factory. The `queryOptions` helper makes this the best pattern.

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
