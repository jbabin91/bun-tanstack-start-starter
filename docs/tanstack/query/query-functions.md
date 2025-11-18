# Query Functions

Query functions (`queryFn`) fetch data. In this project they usually call TanStack Start server functions, keeping server-only logic outside client bundles.

## Server Function Integration

```ts
// src/server/posts.ts
export const getPostsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.posts.findMany();
  },
);

// src/lib/query-options/posts.ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
  });
}
```

## Error Handling

Throw for exceptional errors; return structured objects for validation errors so UI can distinguish.

```ts
export const createPostFn = createServerFn({ method: 'POST' }).handler(
  async (input: PostInput) => {
    try {
      const parsed = schema.parse(input);
      return db.posts.create({ data: parsed });
    } catch (err) {
      if (err instanceof ZodError) {
        return { fieldErrors: err.flatten().fieldErrors };
      }
      throw err;
    }
  },
);
```

Query consumers treat returned `fieldErrors` appropriately (no Error Boundary).

## Abort Support

If a query may be cancelled (navigation away), accept signal:

```ts
export function userOptions(id: number) {
  return queryOptions({
    queryKey: ['user', id],
    queryFn: ({ signal }) => getUserFn(id, { signal }),
  });
}
```

Your server function or fetch wrapper must respect `AbortSignal`.

## Idempotence & Caching

Query functions should be side-effect free (read-only). Mutations handle writes.

## Prefetch + Query Consistency

Use identical function (factory) for prefetch and component query to avoid duplicate network calls.

## Derived Query Functions

Compose specialized queries from base server functions:

```ts
export function filteredPostsOptions(filter: string) {
  return queryOptions({
    queryKey: ['posts', 'filter', filter],
    queryFn: () => getPostsFn({ filter }),
  });
}
```

## Data Normalization

Normalize server response in query function when shared across many components:

```ts
queryFn: async () => {
  const raw = await getPostsFn();
  return raw.map((r) => ({ ...r, title: r.title.trim() }));
};
```

Alternatively use `select` for component-specific transforms to keep raw cached form unmodified.

## Caching & Staleness Control

Assign `staleTime` based on volatility of data; keep logic centralized in factory.

## Anti-Patterns

| Anti-pattern                                    | Fix                                           |
| ----------------------------------------------- | --------------------------------------------- |
| Performing writes in `queryFn`                  | Use mutation/server function with useMutation |
| Swallowing errors silently                      | Throw or return structured error data         |
| Duplicating parsing in each component           | Centralize in query function or `select`      |
| Divergent function between loader and component | Use shared factory                            |

## Cross-References

- Factories: `./query-options.md`
- Mutations: `./mutations.md`
- Suspense: `./suspense.md`

## Summary

Keep query functions pure, consistent, and centralized via factories. Handle validation gracefully, support cancellation when needed, and reuse identical definitions for prefetch and consumption to maximize caching efficiency.
