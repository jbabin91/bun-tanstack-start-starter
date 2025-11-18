# Placeholder Data

`placeholderData` is a temporary value shown while the real query result is loading. Unlike `initialData`, it does not mark the query fresh and is replaced once the fetch resolves.

## Example

```tsx
useQuery({
  ...statsOptions(),
  placeholderData: { count: 0, delta: 0 },
});
```

## When to Use

- Cosmetic smoothing to reduce layout shift
- Non-critical panels where showing zeros is acceptable

## Relation to `initialData`

- `initialData` seeds the cache and is treated as real data (fresh until stale)
- `placeholderData` is a temporary value that is discarded after the fetch returns

See `./initial-data.md` for bootstrap patterns and using previous data as placeholder.

## Cross-References

- Initial data: `./initial-data.md`
- Paginated queries: `./paginated-queries.md`

## Summary

Use `placeholderData` for cosmetic placeholders while a query loads; reserve `initialData` for seeding real cached data without SSR.

## Further Reading

- Placeholder vs Initial Data: <https://tkdodo.eu/blog/placeholder-and-initial-data-in-react-query>
