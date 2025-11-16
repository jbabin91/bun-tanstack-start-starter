# TanStack Query Integration

> [!IMPORTANT]
> This guide assumes you've read the [External Data Loading](external-data-loading.md) guide. This integration automates SSR dehydration/hydration and streaming between TanStack Router and TanStack Query.

## What You Get

- Automatic SSR dehydration/hydration of `QueryClient`
- Streaming of queries that resolve during server render to client
- Redirect handling for `redirect()` thrown from queries/mutations
- Optional `QueryClientProvider` wrapping

## Installation

```sh
bun add @tanstack/react-router-ssr-query
```

## Setup

Create your router with the integration. Ensure a fresh `QueryClient` per request in SSR:

```tsx
// src/router.tsx
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // Optional:
    // handleRedirects: true,
    // wrapQueryClient: true,
  });

  return router;
}
```

By default, the integration wraps with `QueryClientProvider`. If you provide your own, pass `wrapQueryClient: false`.

## SSR Behavior and Streaming

- **Server render**: Integration dehydrates initial queries and streams subsequent queries
- **Client hydrate**: Incremental hydration of initial state and streamed queries
- `useSuspenseQuery` or loader prefetches participate in SSR/streaming
- Plain `useQuery` does not execute on server

## Using in Routes

### `useSuspenseQuery` vs `useQuery`

```tsx
// Suspense: runs on server, streams to client
const { data } = useSuspenseQuery(postsQuery);

// Non-suspense: client-only, fetches after hydration
const { data, isLoading } = useQuery(postsQuery);
```

### Preload in Loader, Read in Component

Preload critical data in route `loader` to avoid waterfalls, then read with hooks. The integration ensures data is dehydrated/streamed during SSR:

```tsx
// src/routes/posts.tsx
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

const postsQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetch('/api/posts').then((r) => r.json()),
});

export const Route = createFileRoute('/posts')({
  // Ensure data in cache before render
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
});

function PostsPage() {
  // Prefer suspense for best SSR + streaming
  const { data } = useSuspenseQuery(postsQuery);
  return <div>{data.map((p: any) => p.title).join(', ')}</div>;
}
```

### Prefetching and Streaming

Prefetch without consuming in components. If you return the promise, it blocks SSR. If you don't await/return, the query starts on server and streams without blocking:

```tsx
export const Route = createFileRoute('/user/$id')({
  loader: ({ params, context }) => {
    // Don't await or return - kicks off query to stream to client
    context.queryClient.fetchQuery(userQuery(params.id));
  },
});
```

## Redirect Handling

If a query/mutation throws `redirect(...)`, the integration intercepts it on client and performs router navigation.

- Enabled by default
- Disable with `handleRedirects: false` for custom handling

## Works with TanStack Start

TanStack Start uses TanStack Router internally. Same setup applies, streaming automatic.
