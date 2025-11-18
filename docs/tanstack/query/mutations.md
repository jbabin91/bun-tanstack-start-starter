# Mutations

Mutations change server state (create, update, delete). In this project they call TanStack Start server functions and coordinate cache updates, invalidation, and optimistic UX.

## Basics

```ts
const createPost = useMutation({
  mutationFn: (input: PostInput) => createPostFn(input),
});
```

Server function returns the canonical new entity. Prefer returning fully hydrated objects (including generated IDs) to simplify cache updates.

### Invoking Mutations: `mutate` vs `mutateAsync`

`useMutation` returns two functions:

- **`mutate`**: Fire-and-forget, handles errors internally. Use callbacks for side effects.
- **`mutateAsync`**: Returns a Promise. Requires manual error handling (try/catch).

```ts
// ✅ Preferred: mutate with callbacks
const onSubmit = () => {
  createPost.mutate(data, {
    onSuccess: (newPost) => navigate(`/posts/${newPost.id}`),
  });
};

// ⚠️ Requires try/catch
const onSubmit = async () => {
  try {
    const newPost = await createPost.mutateAsync(data);
    navigate(`/posts/${newPost.id}`);
  } catch (error) {
    // Must handle or get unhandled promise rejection
  }
};
```

**When to use `mutateAsync`**: Concurrent mutations (`Promise.all`), dependent mutations (callback hell), or when you need the Promise for control flow.

### Single Argument Rule

Mutations accept only one argument for variables. Use an object for multiple values:

```ts
// ❌ Invalid - multiple arguments don't work
const mutation = useMutation({
  mutationFn: (title, body) => updateTodo(title, body),
});
mutation.mutate('hello', 'world'); // Won't work

// ✅ Use an object
const mutation = useMutation({
  mutationFn: ({ title, body }) => updateTodo(title, body),
});
mutation.mutate({ title: 'hello', body: 'world' });
```

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

### Callback Separation: Hook vs Invocation

Callbacks on `useMutation` fire before callbacks on `mutate`. If the component unmounts, `mutate` callbacks won't fire.

**Best practice**: Separate concerns

- **Hook callbacks**: Query-related logic (invalidation, cache updates) that must always happen
- **Invocation callbacks**: UI-related actions (redirects, toasts) that are context-specific

```ts
// ✅ Reusable hook with query logic
const useUpdateTodo = () =>
  useMutation({
    mutationFn: updateTodo,
    // Always invalidate the list
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todos', 'list'],
      });
    },
  });

// In component: UI-specific actions
const updateTodo = useUpdateTodo();
updateTodo.mutate(
  { title: 'newTitle' },
  {
    // Only redirect if still on detail page when mutation completes
    onSuccess: () => navigate('/todos'),
  },
);
```

This keeps custom hooks reusable while allowing per-invocation UI customization.

### Awaited Promises in Callbacks

Promises returned from callbacks are awaited. If you want the mutation to stay in `loading` state while queries refetch:

```ts
{
  // ✅ Mutation loading until invalidation completes
  onSuccess: () => {
    return queryClient.invalidateQueries({
      queryKey: ['posts', id, 'comments'],
    });
  },
}

{
  // 🚀 Fire-and-forget - won't wait
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['posts', id, 'comments'],
    });
  },
}
```

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

- **Use sparingly**: Only when instant feedback is critical (toggle buttons, likes). Most mutations don't need optimistic updates.
- **Complexity cost**: Must mimic server logic (ID generation, sorting, filtering). More code = more edge cases.
- **UX considerations**: Premature UI changes (closing dialogs, redirects) are hard to rollback.
- **Keep distinguishable**: Use negative IDs or other markers for optimistic entries.
- **Rollback context**: Return previous state from `onMutate` for error recovery.
- **Server is source of truth**: Refetch after success to catch server-side changes from other users.

**When not to use**:

- Forms that close/redirect immediately (can't undo gracefully)
- Sorted lists where position might change
- Operations that frequently fail
- When a loading state + button disable is sufficient UX

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
- React Query and Forms: <https://tkdodo.eu/blog/react-query-and-forms>
