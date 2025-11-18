# Important Defaults

TanStack Query has sensible defaults that work well for most applications. Understanding these defaults helps you configure queries appropriately for your use case.

## Query Defaults

### staleTime: 0

**Default:** `0` (queries become stale immediately)

Queries are considered stale the moment they're fetched. When a stale query is accessed (component mounts, window refocuses), Query refetches it in the background.

**Project convention:**

```ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**When to increase `staleTime`:**

- Data changes infrequently (user profiles, site settings)
- Reducing server load is a priority
- UX benefits from showing slightly stale data without refetches

**When to keep it low/zero:**

- Real-time data (notifications, live scores)
- Critical accuracy (financial data, inventory)

### gcTime: 5 minutes (300,000 ms)

**Default:** `5 * 60 * 1000`

Previously called `cacheTime` in v4. Determines how long inactive query data stays in cache before garbage collection.

**Lifecycle:**

1. Query becomes inactive (no components using it)
2. Data remains cached for 5 minutes
3. If query isn't used again, data is garbage collected
4. If query is used again, data is reused (even if stale, avoiding refetch delay)

**Project convention:** Usually keep the default unless you have memory constraints or want longer-term caching.

```ts
// Increase gcTime for data you want to persist longer
export function userPreferencesOptions() {
  return queryOptions({
    queryKey: ['user', 'preferences'],
    queryFn: () => getUserPreferencesFn(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

### refetchOnWindowFocus: true

**Default:** `true`

When the browser tab regains focus, all stale queries refetch automatically.

**Project convention:** Keep enabled for most queries to ensure data freshness when users return to the app.

**When to disable:**

```ts
export function staticConfigOptions() {
  return queryOptions({
    queryKey: ['config'],
    queryFn: () => getConfigFn(),
    staleTime: Infinity, // Never stale
    refetchOnWindowFocus: false,
  });
}
```

Use when data never changes or changes are irrelevant (static config, changelog).

**Global disable (if needed):**

```ts
// src/providers/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable for all queries
    },
  },
});
```

### refetchOnMount: true

**Default:** `true`

When a component mounts, if the query data is stale, refetch it.

**Project convention:** Keep enabled. Ensures components always have fresh data on mount.

### refetchOnReconnect: true

**Default:** `true`

When the network reconnects, refetch all stale queries.

**Project convention:** Keep enabled. Critical for offline-first scenarios.

### retry: 3

**Default:** `3` (for queries), `0` (for mutations)

Failed queries retry 3 times with exponential backoff before showing an error.

**Retry delay calculation:**

```ts
attempt 1: min(1000 * 2^0, 30000) = 1000ms
attempt 2: min(1000 * 2^1, 30000) = 2000ms
attempt 3: min(1000 * 2^2, 30000) = 4000ms
```

**Project convention:**

```ts
// Most queries: keep default retry
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    // retry: 3 (default)
  });
}

// Non-retryable errors: disable retry
export function createPostFn(data: PostInput) {
  return createServerFn({ method: 'POST' }).handler(async () => {
    // Validation errors shouldn't retry
    const validated = schema.parse(data);
    return db.posts.create({ data: validated });
  });
}

// In mutation:
const createPost = useMutation({
  mutationFn: createPostFn,
  retry: 0, // Mutations don't retry by default
});
```

**Custom retry logic:**

```ts
export function criticalQueryOptions() {
  return queryOptions({
    queryKey: ['critical'],
    queryFn: () => getCriticalDataFn(),
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (
        error instanceof Response &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      // Retry 5xx errors up to 5 times
      return failureCount < 5;
    },
  });
}
```

### refetchInterval: false

**Default:** `false` (no polling)

Queries don't poll by default. Enable for data that needs periodic updates:

```ts
export function liveNotificationsOptions() {
  return queryOptions({
    queryKey: ['notifications', 'live'],
    queryFn: () => getNotificationsFn(),
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is inactive
  });
}
```

## Mutation Defaults

### retry: 0

**Default:** `0` (mutations don't retry)

Mutations are typically not idempotent (creating a post twice creates two posts), so retries are disabled by default.

**When to enable:**

```ts
const updateProfile = useMutation({
  mutationFn: updateProfileFn,
  retry: 3, // Safe for idempotent updates
});
```

Only retry mutations that are safe to repeat (PUT/PATCH updates, idempotent operations).

## Project-Wide Configuration

### QueryClient Setup

```ts
// src/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // Refetch aggressively
      gcTime: 5 * 60 * 1000,          // Cache for 5 minutes
      refetchOnWindowFocus: true,     // Refetch on tab focus
      refetchOnMount: true,           // Refetch on component mount
      refetchOnReconnect: true,       // Refetch on network reconnect
      retry: 3,                       // Retry failed queries 3 times
    },
    mutations: {
      retry: 0,                       // Don't retry mutations
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Per-Query Overrides

Individual queries can override defaults:

```ts
export function staticDataOptions() {
  return queryOptions({
    queryKey: ['static'],
    queryFn: () => getStaticDataFn(),
    staleTime: Infinity, // Never stale
    gcTime: Infinity, // Never garbage collect
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount
  });
}
```

## Common Patterns in This Project

### Dynamic Data (Posts, Comments, Users)

```ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Other defaults apply
  });
}
```

### Static/Config Data

```ts
export function configOptions() {
  return queryOptions({
    queryKey: ['config'],
    queryFn: () => getConfigFn(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
```

### Real-time Data (Polling)

```ts
export function liveDataOptions() {
  return queryOptions({
    queryKey: ['live'],
    queryFn: () => getLiveDataFn(),
    staleTime: 0,
    refetchInterval: 10 * 1000, // Poll every 10 seconds
  });
}
```

### Offline-First Data

```ts
export function offlineDataOptions() {
  return queryOptions({
    queryKey: ['offline'],
    queryFn: () => getOfflineDataFn(),
    networkMode: 'offlineFirst', // Serve from cache when offline
    staleTime: 10 * 60 * 1000,
  });
}
```

## Next Steps

- **[query-options.md](./query-options.md)** ⭐ - Create queryOptions factories for reusable queries
- **[queries.md](./queries.md)** - Use useQuery and useSuspenseQuery
- **[query-retries.md](./query-retries.md)** - Custom retry logic
- **[network-mode.md](./network-mode.md)** - Configure offline behavior

## External Resources

- [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query Retries](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)
- [Window Focus Refetching](https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching)
