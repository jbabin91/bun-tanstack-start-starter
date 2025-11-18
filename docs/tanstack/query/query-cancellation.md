# Query Cancellation

Cancel in-flight queries to prevent race conditions and wasted work during navigation.

## AbortController Pattern

```ts
export function userOptions(id: number) {
  return queryOptions({
    queryKey: ['user', id],
    queryFn: ({ signal }) => getUserFn(id, { signal }),
  });
}
```

Ensure your server function/fetch respects `AbortSignal` and stops work quickly.

## Cancel Before Optimistic Writes

```ts
await queryClient.cancelQueries({ queryKey: postQueries.lists() });
```

Prevents outdated writes from landing after optimistic changes.

## Cancel on Unmount

Long tasks (uploads):

```ts
useEffect(() => () => controller.abort(), []);
```

## Cross-References

- Mutations: `./mutations.md`
- Invalidation: `./query-invalidation.md`

## Summary

Wire `AbortSignal` through query functions and cancel relevant queries before stateful operations to eliminate races.
