# Selective SSR

Selective SSR lets you opt routes out of server rendering (or render data only) on a per-route basis. Use it when loaders or components rely on browser-only APIs or you want client-only rendering for performance.

## `ssr` options

| Value                         | Behavior                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| `true` (default)              | Run `beforeLoad`/`loader` on server and render component                 |
| `false`                       | Skip server loader/component; run them on client during hydration        |
| `'data-only'`                 | Run `beforeLoad`/`loader` on server, but render component only on client |
| `({ params, search }) => ...` | Decide at runtime (server-only function)                                 |

### Per-route configuration

```ts
export const Route = createFileRoute('/posts/$postId')({
  ssr: 'data-only',
  loader: () => getPost(),
  component: PostPage,
});
```

### Functional form

```ts
export const Route = createFileRoute('/docs/$docType/$docId')({
  validateSearch: z.object({ details: z.boolean().optional() }),
  ssr: ({ params, search }) => {
    if (params.status === 'success' && params.value.docType === 'sheet')
      return false;
    if (search.status === 'success' && search.value.details) return 'data-only';
  },
});
```

`params`/`search` include validation status; this function runs only on the server for the initial request.

## Inheritance

Child routes inherit the parent’s `ssr` value but can only restrict further (e.g., `true → data-only → false`). More restrictive settings override parent values.

## Router-wide default

Set via `createStart({ defaultSsr })` if most routes need a different default:

```ts
export const startInstance = createStart(() => ({
  defaultSsr: false,
}));
```

## Fallback rendering

When `ssr` is `false` or `'data-only'`, the server renders the route’s `pendingComponent` (or default) as a placeholder. Configure `pendingComponent`/`defaultPendingComponent` and `pendingMinMs` for better UX.

## Root route considerations

The root route can disable SSR for its main component, but the `shellComponent` (HTML skeleton) always renders on the server.

## Workflow

- Use SSR for predictable routes that benefit from fast first paint.
- Use `'data-only'` when server-rendered data is needed but the component must run client-only.
- Use `false` for fully client-side experiences (canvas, map, charts that rely on DOM APIs).

## See Also

- [SSR & Hydration](../query/ssr-hydration.md) - Query prefetching and hydration with SSR
- [Advanced SSR](../query/advanced-ssr.md) - Streaming and selective SSR coordination
- [Suspense](../query/suspense.md) - useSuspenseQuery with selective SSR
- [Initial Data](../query/initial-data.md) - Loader data hydration patterns
