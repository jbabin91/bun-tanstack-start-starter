# Optimistic Updates

Optimistic updates update the UI immediately before the server confirms the mutation. They improve UX for latency-sensitive interactions (adding list items, toggling flags) but introduce consistency risks.

## Core Pattern

1. Cancel relevant queries (avoid race with in-flight fetches)
2. Snapshot previous cache state
3. Write optimistic state
4. Return context with snapshot
5. Roll back on error
6. Reconcile on success (replace stub, adjust data)

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
  onSuccess: (created) => {
    queryClient.setQueryData(
      todoQueries.list('open').queryKey,
      (prev: Todo[] | undefined) =>
        prev ? prev.map((t) => (t.id < 0 ? created : t)) : [created],
    );
  },
});
```

## Choosing the Right Approach

| Scenario                            | Recommended                     |
| ----------------------------------- | ------------------------------- |
| Append/prepend item to a list       | Optimistic add with stub ID     |
| Toggle flag (e.g. completed)        | Optimistic toggle with rollback |
| Large complex object creation       | Wait for server response        |
| Financial / critical integrity data | Avoid optimism                  |

## Stub Identification

Use negative IDs or prefixed identifiers to distinguish stubs:

```ts
const optimistic: Todo = { id: -Date.now(), text, completed: false };
```

On success: replace where `id < 0`.

## Rollbacks

Always store previous state in context returned by `onMutate`. Never attempt to reconstruct previous from current—side effects may have compounded.

## Partial Optimism

Optimistically render minimal representation (e.g., title) and wait for server to fill derived fields (timestamps, computed counts).

## Multi-Query Impact

When entity exists in multiple lists:

```ts
onSuccess: (updated) => {
  for (const filter of ['open', 'closed']) {
    queryClient.setQueryData(
      todoQueries.list(filter).queryKey,
      (prev: Todo[] | undefined) =>
        prev ? prev.map((t) => (t.id === updated.id ? updated : t)) : prev,
    );
  }
};
```

If complexity spikes: invalidate all relevant prefixes instead of manually merging.

## Optimistic Deletes

```ts
const deleteTodo = useMutation({
  mutationFn: (id: number) => deleteTodoFn(id),
  onMutate: async (id) => {
    await queryClient.cancelQueries({
      queryKey: todoQueries.list('open').queryKey,
    });
    const previous = queryClient.getQueryData<Todo[]>(
      todoQueries.list('open').queryKey,
    );
    queryClient.setQueryData(
      todoQueries.list('open').queryKey,
      (prev: Todo[] | undefined) => prev?.filter((t) => t.id !== id),
    );
    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    queryClient.setQueryData(todoQueries.list('open').queryKey, ctx?.previous);
  },
});
```

## Pitfalls

| Pitfall                             | Mitigation                            |
| ----------------------------------- | ------------------------------------- |
| Conflicting optimistic writes       | Cancel queries first                  |
| Duplicate optimistic items          | Use unique negative IDs               |
| Stale derived counts                | Recompute or invalidate after success |
| Validation failure overwriting stub | Roll back entirely (do not keep stub) |

## When Not to Use

- High integrity domains (payments, inventory counts)
- Mutations with unpredictable server-side rules
- Bulk operations with large diff surface

## Cross-References

- Mutations lifecycle: `./mutations.md`
- Invalidation strategies: `./query-invalidation.md`
- Query factories: `./query-options.md`

## Summary

Optimistic updates are powerful for fast feedback. Use them narrowly, maintain clear rollback contexts, mark stubs distinctly, and prefer direct cache edits over broad invalidations when feasible.

## Further Reading

- Concurrent Optimistic Updates: <https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query>
