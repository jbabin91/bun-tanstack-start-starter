# Server-Side Rendering (SSR)

> [!NOTE]
> **TanStack Start handles SSR automatically.** You don't need to manually configure SSR—Start's `@tanstack/react-start` plugin and Nitro server framework handle rendering, hydration, and streaming for you.

This doc explains SSR concepts for reference. If you're using TanStack Start, the routing layer works seamlessly with the framework's built-in SSR capabilities.

## How SSR Works in Start

When you deploy a TanStack Start app:

1. **On server**: Routes load their data via `loader` functions, and components render to HTML
2. **HTML sent to client**: Complete markup with serialized data is streamed/sent to the browser
3. **On client**: React hydrates the static HTML, making it interactive

This happens automatically without you writing server/client entry files or using `RouterClient`, `RouterServer`, or render handlers.

## Key Points

- **File-based routing** with `src/routes/` works out of the box
- **Loaders** are automatically executed on the server and data is dehydrated/sent to the client
- **Streaming** is enabled by default for routes with slow/deferred data
- **Hydration** happens automatically—React takes over the server-rendered HTML

## Data Loading in SSR

Use route `loader` functions to fetch data server-side:

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await fetch('/api/posts').then((r) => r.json());
    return { posts };
  },
  component: PostsPage,
});

function PostsPage() {
  const { posts } = Route.useLoaderData();
  return <div>{posts.map((p) => p.title).join(', ')}</div>;
}
```

The data is loaded on the server, sent to the client, and hydrated automatically.

## TanStack Query Integration

When using TanStack Query with Start, queries prefetched in loaders participate in SSR automatically. See `tanstack-query-integration.md` for details.

For more details on Start's architecture, see the [TanStack Start documentation](https://tanstack.com/start/latest).
