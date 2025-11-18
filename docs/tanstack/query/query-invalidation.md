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

## Cross-References

- Optimistic updates: `./optimistic-updates.md`
- Mutations lifecycle: `./mutations.md`
- Factories for consistent keys: `./query-options.md`

## Summary

Invalidate selectively when direct cache editing is costly. Favor `setQueryData` for simple merges, use prefix invalidation for multi-scope changes, and minimize broad stale marking to retain performance.
