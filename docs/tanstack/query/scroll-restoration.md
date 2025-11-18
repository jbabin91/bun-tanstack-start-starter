# Scroll Restoration

Integrate Router scroll restoration with Query to create smooth list/detail flows.

## Preserve List Scroll on Back

- Keep list items stable via query cache
- Use Router's scroll restoration so back navigation returns to prior scroll position

## Example

```tsx
export const Route = createFileRoute('/posts/')({
  component: PostsPage,
});

function PostsPage() {
  const { data } = useSuspenseQuery(postsOptions());
  return (
    <ul>
      {data.map((p) => (
        <li key={p.id}>
          <Link to="/posts/$id" params={{ id: p.id }}>
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

No special code is required beyond caching; Router will restore the scroll position if enabled globally.

## Anti-Patterns

| Anti-pattern                             | Fix                         |
| ---------------------------------------- | --------------------------- |
| Refetching list on every back navigation | Set non-zero `staleTime`    |
| Re-mounting list component unnecessarily | Keep route/component stable |

## Cross-References

- Prefetching detail: `./prefetching-router.md`
- Queries: `./queries.md`
- Router scroll docs: `../router/scroll-restoration.md`

## Summary

Stable cached list data plus Router's scroll restoration yields instant-feeling back navigation without reloading spinners.
