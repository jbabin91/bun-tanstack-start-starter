# Real-time Updates (WebSockets/SSE)

Use real-time transports to keep cached data fresh without polling. Push events should update the Query cache via `setQueryData` and occasionally trigger invalidation for consistency checks.

## WebSocket example

```ts
// socket.ts
const socket = new WebSocket('wss://example.com/ws');
export function onMessage<T>(event: string, cb: (payload: T) => void) {
  // ...subscribe/unsubscribe implementation
}
```

```tsx
// posts-realtime.tsx
useEffect(() => {
  return onMessage<Post>('post:updated', (post) => {
    queryClient.setQueryData(postQueries.details(post.id).queryKey, post);
    queryClient.setQueryData(
      postQueries.lists().queryKey,
      (prev: Post[] = []) => prev.map((p) => (p.id === post.id ? post : p)),
    );
  });
}, [queryClient]);
```

## Server-Sent Events (SSE)

```ts
useEffect(() => {
  const es = new EventSource('/api/events');
  es.addEventListener('post:created', (e) => {
    const post = JSON.parse((e as MessageEvent).data) as Post;
    queryClient.setQueryData(
      postQueries.lists().queryKey,
      (prev: Post[] = []) => [post, ...prev],
    );
  });
  return () => es.close();
}, [queryClient]);
```

## When to invalidate

- After many incremental updates, call `invalidateQueries` on a low-priority tick to reconcile with the server periodically.
- Use narrow scopes: invalidate `details(id)` or `lists()` rather than broad prefixes.

## Tips

- Keep updates minimal and idempotent; prefer immutable updaters.
- Gate heavy work behind `visibilitychange`/focus events if many events arrive while the tab is hidden.
- Pair with `networkMode: 'offlineFirst'` for offline-friendly UX.

## Further Reading

- Using WebSockets with React Query: <https://tkdodo.eu/blog/using-web-sockets-with-react-query>
