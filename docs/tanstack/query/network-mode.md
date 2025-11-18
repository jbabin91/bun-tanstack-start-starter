# Network Mode

Network mode controls how queries and mutations behave when offline or with unstable connections.

## Understanding Query States

### `status` vs `fetchStatus`

- **`status`**: Information about the data (`loading`, `success`, `error`)
  - `loading`: No data yet
  - `success`: Data available
  - `error`: Request failed
- **`fetchStatus`**: Information about the `queryFn` execution
  - `fetching`: Request is in-flight
  - `paused`: Request is paused (no network)
  - `idle`: Query not running

You can be in multiple states simultaneously:

- `loading` + `paused`: First request paused due to no network
- `success` + `fetching`: Background refetch in progress
- `success` + `paused`: Background refetch paused (no network)

## Network Modes

### `online` (default)

Assumes queries need network connection. Without network, queries enter `paused` state instead of failing immediately.

**Behavior**:

- No network → query pauses (won't fire first request)
- Query enters `paused` fetchStatus
- Retries resume when network returns

**Use for**: Most data fetching scenarios

```ts
export function userProfileOptions(id: string) {
  return queryOptions({
    queryKey: ['users', id],
    queryFn: () => getUserFn(id),
    networkMode: 'online', // default, can omit
  });
}
```

### `always`

Ignores network status completely. Queries always fire regardless of connectivity.

**Behavior**:

- No network check
- Never pauses
- Useful for non-network operations (Web Workers, IndexedDB, local computation)

**Use for**: Queries that don't need network (async processing, local storage)

```ts
export function expensiveComputationOptions(data: Data) {
  return queryOptions({
    queryKey: ['compute', data.id],
    queryFn: () => runInWorker(data), // No network needed
    networkMode: 'always',
  });
}
```

### `offlineFirst`

Fires first request regardless of network (like v3 behavior). If it fails, pauses retries until network returns.

**Behavior**:

- First request always fires
- Browser cache / Service Worker can respond while offline
- If first request fails, retries pause
- Best for PWAs with Service Worker caching

**Use for**: Apps with Service Worker / HTTP cache layers

```ts
export function githubRepoOptions(owner: string, repo: string) {
  return queryOptions({
    queryKey: ['github', owner, repo],
    queryFn: () =>
      fetch(`https://api.github.com/repos/${owner}/${repo}`).then((r) =>
        r.json(),
      ),
    networkMode: 'offlineFirst', // Let browser cache / SW intercept
    staleTime: 60 * 1000, // GitHub sets cache-control: max-age=60
  });
}
```

**Why `offlineFirst` for HTTP caching**: Service Workers intercept fetch requests and serve cached responses. If you use `networkMode: 'online'`, the request won't fire when offline, so the Service Worker can't intercept it.

## Using `fetchStatus` in UI

You can react to the `paused` state to show appropriate UI:

```tsx
const { data, status, fetchStatus } = useQuery(userProfileOptions(id));

if (status === 'loading') {
  if (fetchStatus === 'paused') {
    return <div>Query paused - waiting for network...</div>;
  }
  return <div>Loading...</div>;
}

if (status === 'error') {
  return <div>Error: {error.message}</div>;
}

return (
  <div>
    {data.name}
    {fetchStatus === 'fetching' && <span>Updating...</span>}
  </div>
);
```

## Choosing the Right Mode

| Scenario                          | Network Mode   | Reason                                                      |
| --------------------------------- | -------------- | ----------------------------------------------------------- |
| Standard API calls                | `online`       | Default, pauses gracefully when offline                     |
| Service Worker / HTTP cache       | `offlineFirst` | Allows cache interception, pauses retries if cache miss     |
| Web Worker computation            | `always`       | No network needed, shouldn't pause                          |
| IndexedDB / local storage queries | `always`       | Local operations don't depend on network                    |
| Mobile app with offline support   | `offlineFirst` | Try cache first, fall back to network when available        |
| Real-time data (WebSocket)        | `online`       | Meaningless without connection, pause until network returns |

## Global Configuration

Set network mode globally for all queries/mutations:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst', // All queries use this by default
    },
    mutations: {
      networkMode: 'online', // Mutations can have different default
    },
  },
});
```

Override per-query as needed.

## Cross-References

- Important defaults: `./important-defaults.md`
- Retries: `./query-retries.md` (planned)
- Query options: `./query-options.md`

## Summary

Network mode determines when queries fire and how they behave offline:

- **`online`** (default): Pause queries when offline, resume when network returns. Best for most cases.
- **`always`**: Ignore network status. Use for local operations (Workers, IndexedDB).
- **`offlineFirst`**: Fire first request regardless of network (cache interception), pause retries on failure. Use with Service Workers.

Use `fetchStatus` to distinguish between actively fetching vs paused. React Query provides robust offline support; choose the mode that matches your caching strategy.

## Further Reading

- Offline React Query: <https://tkdodo.eu/blog/offline-react-query>
