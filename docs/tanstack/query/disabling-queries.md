# Disabling Queries

Control when a query runs using the `enabled` option.

## Conditional Execution

```tsx
const userId = Route.useParams().userId;
const { data } = useQuery({
  ...userDetailOptions(userId),
  enabled: !!userId,
});
```

## Suspend Later

Wrap top-level data in Suspense, then use `useQuery` for dependent data gated by `enabled`.

## Loading UX

Provide local skeletons for disabled -> enabled transitions.

## Anti-Patterns

| Anti-pattern                                      | Fix                  |
| ------------------------------------------------- | -------------------- |
| Using placeholder IDs (0, '') to force run        | Use `enabled` gating |
| Throwing errors inside queryFn when param missing | Gate with `enabled`  |

## Cross-References

- Dependent queries: `./dependent-queries.md`
- Queries: `./queries.md`

## Summary

Use `enabled` to control fetch timing for dependent or conditional data instead of placeholder parameters or error suppression.
