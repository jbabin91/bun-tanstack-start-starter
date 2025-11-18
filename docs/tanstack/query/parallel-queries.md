# Parallel Queries

Load multiple queries concurrently to avoid waterfalls. Use separate hooks or grouped APIs depending on coordination needs.

## Independent Parallel Queries

React schedules concurrent `useSuspenseQuery` calls naturally:

```tsx
function Dashboard() {
  const user = useSuspenseQuery(userOptions()).data;
  const settings = useSuspenseQuery(settingsOptions()).data;
  const notifications = useSuspenseQuery(notificationsOptions()).data;
  return (
    <DashboardView
      user={user}
      settings={settings}
      notifications={notifications}
    />
  );
}
```

Each query fetches in parallel; boundary suspends until all resolve.

## Coordinated Parallel Queries

`useSuspenseQueries` groups multiple queries:

```tsx
const results = useSuspenseQueries({
  queries: [userOptions(), settingsOptions(), notificationsOptions()],
});
const [user, settings, notifications] = results.map((r) => r.data);
```

## Conditional Parallelism

Skip queries based on props or auth state:

```tsx
const queries = [userOptions(), settingsOptions()];
if (showNotifications) queries.push(notificationsOptions());
const results = useSuspenseQueries({ queries });
```

## Selecting Data

Apply `select` per query to reduce render churn:

```tsx
useSuspenseQueries({
  queries: [
    {
      ...statsOptions(),
      select: (d) => ({ total: d.items.length }),
    },
    userOptions(),
  ],
});
```

## Error Handling

If any query errors, Error Boundary catches. For partial failure tolerance split into separate boundaries.

```tsx
<ErrorBoundary fallback={<UserError />}>
  <Suspense fallback={<UserLoading />}>
    <UserPanel />
  </Suspense>
</ErrorBoundary>
<ErrorBoundary fallback={<SettingsError />}>
  <Suspense fallback={<SettingsLoading />}>
    <SettingsPanel />
  </Suspense>
</ErrorBoundary>
```

## Refetch Coordination

Invalidate broad prefixes to refetch multiple related queries:

```ts
queryClient.invalidateQueries({ queryKey: userOptions().queryKey.slice(0, 1) }); // 'user' root
```

Or trigger manual refetch:

```tsx
results.forEach((r) => r.refetch());
```

## Avoid Waterfalls

Do not fetch second query only after first completes unless data dependency exists. If dependent, use `enabled` (see dependent queries doc).

## Anti-Patterns

| Anti-pattern                                              | Fix                      |
| --------------------------------------------------------- | ------------------------ |
| Serial awaiting inside loader                             | Use `Promise.all`        |
| Large monolithic Suspense boundary with unrelated queries | Split boundaries         |
| Manual ad-hoc parallel management                         | Use `useSuspenseQueries` |
| Chaining queries without dependency                       | Start together           |

## Cross-References

- Dependent queries: `./dependent-queries.md`
- Suspense: `./suspense.md`
- Factories: `./query-options.md`

## Summary

Run queries concurrently unless a true data dependency exists. Use grouped APIs for coordination, separate boundaries for resilience, and target invalidation for efficient refetching.
