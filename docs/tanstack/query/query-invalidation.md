# Query Invalidation

Invalidation marks queries stale so they refetch on next trigger. Use invalidation when direct cache mutation (`setQueryData`) is complex or incomplete.

## Basic API

```ts
queryClient.invalidateQueries({ queryKey: ['posts'] });
```

Marks queries with keys starting with `['posts']` stale (default `exact: false`). They refetch:

- On component mount
- On window focus
- Immediately if already mounted (stale + active triggers background refetch)

## Scope Selection

| Scope  | Example                                                                             | Use When                            |
| ------ | ----------------------------------------------------------------------------------- | ----------------------------------- |
| Exact  | `queryClient.invalidateQueries({ queryKey: ['posts','list','open'], exact: true })` | Single specific list variant        |
| Prefix | `queryClient.invalidateQueries({ queryKey: ['posts','list'] })`                     | All list variations share change    |
| Broad  | `queryClient.invalidateQueries({ queryKey: ['posts'] })`                            | Entity changes affect many segments |

Prefer the narrowest scope that remains correct.

## When to Prefer setQueryData

| Operation                                | setQueryData?   | Invalidate?  |
| ---------------------------------------- | --------------- | ------------ |
| Append new item                          | Yes             | No           |
| Update single item fields                | Yes             | No           |
| Bulk status change (many items)          | Sometimes (map) | If expensive |
| Complex relational change (tags, counts) | Hard            | Yes          |

## Combining Strategies

Optimistic write then invalidation for server reconciliation:

```ts
onSuccess: () => {
  // Already merged optimistic changes
  queryClient.invalidateQueries({ queryKey: todoQueries.lists() });
};
```

Allows server authoritative data to replace optimistic assumptions.

## Filtering + Invalidating

Use filters for precise targeting:

```ts
queryClient.invalidateQueries({
  queryKey: ['posts'],
  predicate: (q) => q.queryKey.includes('detail'),
});
```

## Manual Stale Marking

Instead of invalidation you can set state manually:

```ts
queryClient.setQueryData(postsOptions().queryKey, existing); // Preserved but still fresh until staleTime
```

If you want it refetched sooner set a short staleTime or invalidate.

## Time-Based Patterns

After mutation success you might delay invalidation to avoid immediate refetch (e.g. real-time UI stable for short period). Use `setTimeout` sparingly:

```ts
setTimeout(() => {
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
}, 2000);
```

## Abort In-Flight Queries Before Invalidating

Cancel active queries to prevent outdated writes racing with fresh data:

```ts
await queryClient.cancelQueries({ queryKey: ['posts'] });
queryClient.invalidateQueries({ queryKey: ['posts'] });
```

## Router Loader Interaction

Loader prefetched queries that become stale will refetch on next navigation or focus. Avoid invalidating immediately after navigation unless data must update instantly.

## Anti-Patterns

| Anti-pattern                                     | Fix                                                   |
| ------------------------------------------------ | ----------------------------------------------------- |
| Blanket invalidation of root keys every mutation | Choose narrower prefix                                |
| Invalidate instead of simple local append        | Use `setQueryData`                                    |
| Invalidation storm (multiple rapid calls)        | Batch related invalidations                           |
| Never invalidating long-lived data               | Set appropriate `staleTime` + occasional invalidation |

## Automatic Invalidation After Mutations

Instead of manually invalidating in every mutation's `onSuccess`, you can set up global callbacks that automatically invalidate queries based on patterns.

### Global MutationCache Callbacks

Configure global invalidation when creating your QueryClient:

```ts
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // Invalidate all queries after any mutation succeeds
      queryClient.invalidateQueries();
    },
  }),
});
```

**Caution:** This invalidates **everything** after every mutation. Only use this if:

- Your app is small (few queries)
- Mutations are infrequent
- You want maximum data freshness at the cost of performance

**Better approach:** Use selective invalidation based on mutation metadata.

### Selective Invalidation with Meta Tags

Tag mutations with metadata, then invalidate only related queries:

```ts
// Define mutation with tags
const createPost = useMutation({
  mutationFn: createPostFn,
  meta: {
    invalidates: [['posts']],
  },
});

const updateUser = useMutation({
  mutationFn: updateUserFn,
  meta: {
    invalidates: [['user']],
  },
});

// Global callback reads meta and invalidates tagged queries
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const invalidates = mutation.options.meta?.invalidates as
        | QueryKey[]
        | undefined;
      if (invalidates) {
        invalidates.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
  }),
});
```

**Benefits:**

- Single global callback handles all invalidation logic
- Mutations declare what they affect (declarative)
- No repeated `onSuccess` callbacks in every mutation
- Easy to audit (search for `meta: { invalidates:` to see all patterns)

**When to use:**

- Medium to large apps with many mutations
- Clear mutation → query relationships
- Want to enforce consistent invalidation patterns

### MutationKey-Based Invalidation

Similar to query keys, mutation keys can group related mutations:

```ts
const createPost = useMutation({
  mutationKey: ['post', 'create'],
  mutationFn: createPostFn,
});

const updatePost = useMutation({
  mutationKey: ['post', 'update'],
  mutationFn: updatePostFn,
});

// Global callback checks mutation key prefix
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.options.mutationKey?.[0] === 'post') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
  }),
});
```

### Awaiting Important Refetches

By default, `invalidateQueries` marks queries stale but doesn't wait for refetches. Use `await` to block until critical refetches complete:

```ts
onSuccess: async () => {
  // Wait for user profile to refetch before continuing
  await queryClient.invalidateQueries({
    queryKey: ['user'],
    refetchType: 'active', // Only refetch mounted queries
  });
  // Now navigate or show success toast
  router.navigate({ to: '/profile' });
};
```

**Use cases:**

- Navigate to page that depends on fresh data
- Show toast only after data updated
- Avoid race conditions (mutation + navigation)

**Caution:** Awaiting adds latency. Only await refetches that are critical for the next UI state.

## Cross-References

- Optimistic updates: `./optimistic-updates.md`
- Mutations lifecycle: `./mutations.md`
- Factories for consistent keys: `./query-options.md`

## Summary

Invalidate selectively when direct cache editing is costly. Favor `setQueryData` for simple merges, use prefix invalidation for multi-scope changes, and minimize broad stale marking to retain performance. For larger apps, consider global `MutationCache` callbacks with meta-based tagging to centralize invalidation logic and avoid repetitive `onSuccess` handlers.
