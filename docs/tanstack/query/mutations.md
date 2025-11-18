# Mutations

Mutations change server state (create, update, delete). In this project they call TanStack Start server functions and coordinate cache updates, invalidation, and optimistic UX.

## Basics

```ts
const createPost = useMutation({
  mutationFn: (input: PostInput) => createPostFn(input),
});
```

Server function returns the canonical new entity. Prefer returning fully hydrated objects (including generated IDs) to simplify cache updates.

## Lifecycle Callbacks

```ts
const createPost = useMutation({
  mutationFn: (input: PostInput) => createPostFn(input),
  onMutate: async (variables) => {
    // Optional optimistic step
  },
  onError: (error, _vars, context) => {
    // Rollback using context from onMutate
  },
  onSuccess: (data, _vars) => {
    // Cache update or invalidation
  },
  onSettled: () => {
    // Final side-effects (logging)
  },
});
```

Use `onSuccess` for direct cache updates when possible; fall back to invalidation when computing diff is complex.

## Automatic Invalidation After Mutations

A mutation that affects multiple related queries can invalidate a hierarchy using a base key prefix. Example with `todoQueries` from factories:

```ts
const queryClient = useQueryClient();

const createTodo = useMutation({
  mutationFn: (input: NewTodo) => createTodoFn(input),
  onSuccess: (newTodo) => {
    // Prefer targeted update
    queryClient.setQueryData(
      todoQueries.list('open').queryKey,
      (prev: Todo[] | undefined) => (prev ? [newTodo, ...prev] : [newTodo]),
    );

    // Fallback: invalidate all list variations
    queryClient.invalidateQueries({
      queryKey: todoQueries.lists(),
      exact: false,
    });
  },
});
```

Guidelines (inspired by community articles on automatic invalidation):

| Situation                   | Strategy                                                               |
| --------------------------- | ---------------------------------------------------------------------- |
| Cheap to merge new entity   | `setQueryData` targeted list update                                    |
| Complex relational impact   | Invalidate affected prefixes                                           |
| Entity deletion             | Filter existing cached list via `setQueryData` + optionally invalidate |
| Multiple lists share entity | Invalidate broad prefix (`todoQueries.all()`)                          |

## Optimistic Updates (with Rollback)

```ts
const queryClient = useQueryClient();

const createTodo = useMutation({
  mutationFn: (text: string) => createTodoFn({ text }),
  onMutate: async (text) => {
    await queryClient.cancelQueries({
      queryKey: todoQueries.list('open').queryKey,
    });
    const previous = queryClient.getQueryData<Todo[]>(
      todoQueries.list('open').queryKey,
    );

    const optimistic: Todo = { id: -Date.now(), text, completed: false };
    queryClient.setQueryData(todoQueries.list('open').queryKey, (prev = []) => [
      optimistic,
      ...prev,
    ]);

    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    queryClient.setQueryData(todoQueries.list('open').queryKey, ctx?.previous);
  },
  onSuccess: (created, _vars) => {
    // Replace optimistic stub with actual entity
    queryClient.setQueryData(
      todoQueries.list('open').queryKey,
      (prev: Todo[] | undefined) =>
        prev ? prev.map((t) => (t.id < 0 ? created : t)) : [created],
    );
  },
});
```

### Optimistic Guidelines

- Only use when latency harms UX significantly
- Keep optimistic entities distinguishable (negative ID prefix)
- Provide rollback context from `onMutate`
- Ensure server validation (never trust optimistic data blindly)

## Mutations + Forms (Planned Integration)

TanStack Form will manage field and validation state, while Query handles persistence and cache coordination:

```ts
const form = useForm({
  defaultValues: { title: '', content: '' },
  onSubmit: async ({ value }) => {
    await createPost.mutateAsync(value);
  },
});
```

Form responsibilities:

- Field state, touched, errors
- Client-side validation
- Submission orchestration

Mutation responsibilities:

- Server function invocation
- Optimistic UI (if needed)
- Cache update / invalidation

## Error Handling

Use Error Boundaries for thrown errors (from server functions). For form-level errors (validation), parse on server and return structured responses rather than throwing.

```ts
try {
  const parsed = schema.parse(input);
  return db.posts.create({ data: parsed });
} catch (err) {
  if (err instanceof ZodError) {
    // Return structured error, don't throw -> handled by mutation error state
    return { fieldErrors: err.flatten().fieldErrors };
  }
  throw err;
}
```

## Cancellation

Abort long-running mutations when component unmounts or route changes:

```ts
const controller = new AbortController();

const upload = useMutation({
  mutationFn: (file: File) => uploadFileFn(file, { signal: controller.signal }),
});

useEffect(() => () => controller.abort(), []);
```

## Selecting Invalidation Scope

```ts
// Narrow (exact list variant)
queryClient.invalidateQueries({ queryKey: todoQueries.list('open').queryKey });

// All lists
queryClient.invalidateQueries({ queryKey: todoQueries.lists(), exact: false });

// Everything involving todos
queryClient.invalidateQueries({ queryKey: todoQueries.all(), exact: false });
```

Prefer the narrowest scope that maintains correctness.

## Cross-References

- Query factories: `./query-options.md`
- Optimistic updates: `./optimistic-updates.md` (to be created)
- Invalidation patterns: `./query-invalidation.md` (to be created)

## External Resources

- Automatic Invalidation Concepts: [https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations)

## Summary

Mutations update server state. Prefer direct cache updates for cheap operations; invalidate selectively when impact spans multiple scopes. Use optimistic updates sparingly with clear rollback mechanisms and plan for Form integration to separate UI validation from persistence.

## Further Reading

- Mastering Mutations: <https://tkdodo.eu/blog/mastering-mutations-in-react-query>
