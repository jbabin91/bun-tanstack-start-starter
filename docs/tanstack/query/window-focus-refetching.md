# Window Focus Refetching

By default, stale queries refetch when the window regains focus. This keeps data fresh when users return to the app.

## Configure Globally

```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
});
```

Disable globally (rare):

```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
```

## Per-Query Override

```ts
useQuery({
  ...staticConfigOptions(),
  refetchOnWindowFocus: false,
});
```

## Cross-References

- Important defaults: `./important-defaults.md`
- Background fetching: `./background-fetching.md`

## Summary

Keep focus refetching enabled for most queries. Disable per-query for static data where unexpected updates could distract or are unnecessary.
