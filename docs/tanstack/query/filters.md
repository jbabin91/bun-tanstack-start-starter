# Filters

Derive filtered views efficiently using `select` or by encoding filter dimensions in query keys.

## Key-Based Filters

Include filter term in key when it affects server result:

```ts
queryKey: ['posts', 'list', filter];
```

## Client-Side Derived Filters

When server result is the same but view differs, use `select` to derive filtered slices:

```tsx
const { data: open } = useQuery({
  ...postsOptions(),
  select: (all) => all.filter((p) => !p.closed),
});
```

## Avoid Recompute

Memoize predicates or move heavy work into `select` to leverage structural sharing.

## Cross-References

- Query keys: `./query-keys.md`
- Render optimizations: `./render-optimizations.md`

## Summary

Encode true data differences in keys; prefer `select` for lightweight client-only filters to minimize cache duplication and re-renders.
