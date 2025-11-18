# Default Query Function

A default query function can reduce boilerplate in small apps by mapping keys to endpoints. In larger apps, prefer explicit factories.

## Global Default

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [resource, id] = queryKey as [string, number?];
        const url = id ? `/${resource}/${id}` : `/${resource}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      },
    },
  },
});
```

## Caveats

- Hard to type precisely
- Encourages stringly-typed keys
- Reduces discoverability of query shapes

## Recommendation

Use explicit `queryOptions` factories for clarity and type safety in this project. Consider a default only for prototypes.

## Cross-References

- Factories: `./query-options.md`
- Query functions: `./query-functions.md`

## Summary

While convenient, a global default query function trades type safety and clarity for brevity. Prefer explicit factories in production codebases.
