# Query Retries

Queries retry transient failures automatically.

## Defaults

- `retry: 3`
- Exponential backoff with `retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)`

## Customize Per Query

```ts
export function robustOptions() {
  return queryOptions({
    queryKey: ['robust'],
    queryFn: () => getRobustFn(),
    retry: (count, error) => {
      if (
        error instanceof Response &&
        error.status >= 400 &&
        error.status < 500
      )
        return false;
      return count < 5;
    },
    retryDelay: (i) => Math.min(1000 * 2 ** i, 15000),
  });
}
```

## Disable Retries

```ts
useQuery({ ...staticOptions(), retry: false });
```

## Mutations

Mutations do not retry by default (`retry: 0`). Only enable for idempotent operations.

## Cross-References

- Important defaults: `./important-defaults.md`
- Mutations: `./mutations.md`

## Summary

Keep default retries for network resilience. Disable for client errors (4xx) and tune delay/attempts for critical reads.
