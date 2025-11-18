# Updates from Mutation Responses

After successful mutations, update relevant cached queries directly with `setQueryData` to reflect the new server state immediately.

## Append New Entity

```ts
onSuccess: (created) => {
  queryClient.setQueryData(
    postQueries.list('recent').queryKey,
    (prev: Post[] | undefined) => (prev ? [created, ...prev] : [created]),
  );
};
```

## Update Existing Entity

```ts
onSuccess: (updated) => {
  for (const filter of ['recent', 'popular']) {
    queryClient.setQueryData(
      postQueries.list(filter).queryKey,
      (prev: Post[] | undefined) =>
        prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev,
    );
  }
};
```

## Remove Deleted Entity

```ts
onSuccess: (deletedId) => {
  queryClient.setQueryData(
    postQueries.list('recent').queryKey,
    (prev: Post[] | undefined) => prev?.filter((p) => p.id !== deletedId),
  );
};
```

## Merge Server Counters

```ts
onSuccess: (result) => {
  queryClient.setQueryData(
    statsOptions().queryKey,
    (prev: Stats | undefined) =>
      prev ? { ...prev, count: result.count } : result,
  );
};
```

## When to Invalidate

If many lists or complex relations are affected, invalidate a broader prefix to refresh from the server:

```ts
queryClient.invalidateQueries({ queryKey: postQueries.all(), exact: false });
```

## Cross-References

- Mutations: `./mutations.md`
- Invalidation: `./query-invalidation.md`
- Optimistic updates: `./optimistic-updates.md`

## Summary

Prefer targeted `setQueryData` updates after mutations for responsive UIs; fall back to invalidation for complex synchronization scenarios.
