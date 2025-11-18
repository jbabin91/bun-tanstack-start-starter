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

## Concurrent Optimistic Updates

### Window of Inconsistency

When mutations happen while queries are in-flight, optimistic updates can be overwritten:

```text
Timeline:
1. Query starts (window focus refetch)
2. User triggers mutation (optimistic update applied)
3. Query settles (overwrites optimistic update) ⚠️
4. Mutation settles (refetch corrects data)
```

This creates a brief "flicker" where the UI shows stale data between steps 3-4.

**Query cancellation helps:**

```ts
onMutate: async () => {
  // Cancel in-flight queries to prevent overwrite
  await queryClient.cancelQueries({
    queryKey: ['todos', id],
  });
  // ... optimistic update
};
```

Now mutations cancel conflicting queries when they start, preventing the overwrite.

### Concurrent Mutation Problem

Query cancellation doesn't solve everything. Consider:

```text
Timeline:
1. Mutation A starts (optimistic update A)
2. Mutation B starts (optimistic update B)
3. Mutation A settles (invalidates queries, refetch starts)
4. Refetch settles (overwrites optimistic update B) ⚠️
5. Mutation B settles (refetch corrects data)
```

Mutation B can't cancel the refetch from Mutation A because there's nothing in-flight when B starts.

### Preventing Over-Invalidation

Skip invalidations when other mutations are in progress:

```ts
const useToggleIsActive = (id: number) =>
  useMutation({
    mutationKey: ['todos', 'toggle'],
    mutationFn: api.toggleIsActive,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['todos', 'detail', id],
      });

      // Optimistic update
      queryClient.setQueryData(['todos', 'detail', id], (prev) =>
        prev ? { ...prev, isActive: !prev.isActive } : undefined,
      );
    },
    onSettled: () => {
      // ✅ Only invalidate if no other mutations are running
      if (queryClient.isMutating() === 1) {
        queryClient.invalidateQueries({
          queryKey: ['todos', 'detail', id],
        });
      }
    },
  });
```

**Why `=== 1`?** When `onSettled` runs, the current mutation is still in progress, so the count will never be 0. We check for 1 to ensure no _other_ mutations are running.

**Imperative timing:** Use `queryClient.isMutating()` (imperative), not `useIsMutating()` (hook), to avoid stale closure issues. We need the count _right before_ invalidating.

### Limiting Scope with mutationKey

The above check is too broad—it skips invalidation if _any_ mutation is running. Scope it with `mutationKey`:

```ts
const useToggleIsActive = (id: number) =>
  useMutation({
    mutationKey: ['todos', 'toggle'], // ✅ Tag related mutations
    mutationFn: api.toggleIsActive,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos', 'detail', id] });
      queryClient.setQueryData(['todos', 'detail', id], (prev) =>
        prev ? { ...prev, isActive: !prev.isActive } : undefined,
      );
    },
    onSettled: () => {
      // ✅ Only skip if another 'todos/toggle' mutation is running
      if (queryClient.isMutating({ mutationKey: ['todos', 'toggle'] }) === 1) {
        queryClient.invalidateQueries({ queryKey: ['todos', 'detail', id] });
      }
    },
  });
```

Now unrelated mutations (e.g., creating a new todo) won't prevent this invalidation.

### Final Flow

```text
Timeline (with fix):
1. Query starts (window focus refetch)
2. Mutation A starts (cancels query, optimistic update A)
3. Mutation B starts (no query to cancel, optimistic update B)
4. Mutation A settles (checks isMutating === 1? No, skips invalidation) ✅
5. Mutation B settles (checks isMutating === 1? Yes, invalidates) ✅
6. Refetch settles (correct data)
```

No flickering. Last mutation wins and triggers the refetch.

### Practical Considerations

**Use mutation keys consistently:**

```ts
// All todo mutations share prefix
const useTodoMutation = (action: string) =>
  useMutation({
    mutationKey: ['todos', action],
    // ...
  });
```

**Tradeoff:** This pattern assumes concurrent mutations affect the same data. If they're independent, use different mutation keys.

**When not to use:** If you invalidate everything at the end anyway (e.g., `invalidateQueries({ queryKey: [] })`), this optimization is unnecessary.

## Summary

Optimistic updates are powerful for fast feedback. Use them narrowly, maintain clear rollback contexts, mark stubs distinctly, and prefer direct cache edits over broad invalidations when feasible. For concurrent mutations, prevent over-invalidation with `isMutating` checks scoped to relevant mutation keys.

## Further Reading

- Concurrent Optimistic Updates: <https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query>
