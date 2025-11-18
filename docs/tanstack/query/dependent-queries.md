# Dependent Queries

Dependent (or chained) queries wait for prerequisite data before executing. Use the `enabled` option to prevent premature fetches.

## Basic Pattern

```tsx
const user = useSuspenseQuery(userOptions()).data;
const { data: settings } = useQuery({
  ...userSettingsOptions(user.id),
  enabled: !!user.id,
});
```

`settings` query does not fire until `user.id` is available.

## Multiple Dependencies

```tsx
const org = useSuspenseQuery(orgOptions()).data;
const project = useQuery({ ...projectOptions(org.id), enabled: !!org.id }).data;
const tickets = useQuery({
  ...ticketsOptions(project.id),
  enabled: !!project?.id,
}).data;
```

## Derived Keys and Enabled

Include dependent identifiers in key only once they exist. If using factory pattern, guard early:

```ts
export function projectOptions(orgId: number | undefined) {
  return queryOptions({
    queryKey: ['project', orgId],
    queryFn: () => getProjectFn(orgId!),
    enabled: typeof orgId === 'number',
  });
}
```

## Sequential vs Parallel

Only sequence when output of first query determines key or parameters of second. Otherwise run in parallel.

## Suspense Considerations

Using `useSuspenseQuery` for the first query + `useQuery` for dependent ones prevents entire tree from suspending longer than necessary. Or nest boundaries:

```tsx
<Suspense fallback={<UserLoading />}>
  <UserAndSettings />
</Suspense>
```

Inside component, use conditional enabled logic.

## Avoiding Undefined Access

Type assertions (`orgId!`) are safe in query function only with parallel `enabled` gating. Prefer explicit guards.

## Fallback UI

Show partial UI while dependent query loads:

```tsx
if (!settings) return <SettingsSkeleton />;
```

## Anti-Patterns

| Anti-pattern                                          | Fix                               |
| ----------------------------------------------------- | --------------------------------- |
| Fetching dependent query with placeholder ID (e.g. 0) | Use `enabled` gating              |
| Serial queries without true dependency                | Run in parallel                   |
| Using try/catch to suppress missing param errors      | Gate with `enabled`               |
| Omitting param from key                               | Include all data-impacting params |

## Cross-References

- Parallel queries: `./parallel-queries.md`
- Factories: `./query-options.md`
- Suspense: `./suspense.md`

## Summary

Gate dependent queries with `enabled`, include real parameters in keys only when available, and limit sequencing to genuine dependencies to avoid waterfalls.
