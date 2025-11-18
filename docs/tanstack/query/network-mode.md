# Network Mode

Network mode controls how queries behave when offline or with unstable connections.

## Modes

- `online` (default): Queries fail when offline
- `always`: Queries run regardless of network status
- `offlineFirst`: Serve from cache when offline, queue refetch when online

## Usage

```ts
export function offlineNotificationsOptions() {
  return queryOptions({
    queryKey: ['notifications'],
    queryFn: () => getNotificationsFn(),
    networkMode: 'offlineFirst',
    staleTime: 5 * 60 * 1000,
  });
}
```

## When to Use

- `always`: For non-network operations guarded by `queryFn` (rare)
- `offlineFirst`: Mobile/offline-friendly UX where cached data is acceptable temporarily

## Cross-References

- Important defaults: `./important-defaults.md`
- Retries: `./query-retries.md`

## Summary

Pick a network mode that matches UX expectations during offline periods. Prefer `offlineFirst` for cached reads and schedule refetch when connectivity returns.

## Further Reading

- Offline React Query: <https://tkdodo.eu/blog/offline-react-query>
