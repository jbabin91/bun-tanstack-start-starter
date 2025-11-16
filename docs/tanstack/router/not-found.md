# Not Found Errors

TanStack Router handles not-found errors in two scenarios:

1. **Non-matching paths**: When a path doesn't match any route pattern or partially matches with extra segments
2. **Missing resources**: When a resource (post, user, etc.) doesn't exist

## The `notFoundMode` Option

When a pathname doesn't match any route or has extra trailing segments, the router automatically throws a not-found error. The `notFoundMode` controls how it's handled:

### `notFoundMode: 'fuzzy'` (default)

The router finds the nearest matching route with children and a `notFoundComponent`. This preserves parent layouts for context.

Route tree:

```sh
__root__ (has notFoundComponent)
  posts (has notFoundComponent)
    $postId (has notFoundComponent)
```

Path `/posts/1/edit` renders:

```tsx
<Root>
  <Posts>
    <Posts.notFoundComponent />
  </Posts>
</Root>
```

The `posts` route handles the error (closest suitable parent with an outlet and `notFoundComponent`).

### `notFoundMode: 'root'`

All not-found errors are handled by the root route's `notFoundComponent`:

```tsx
<Root>
  <Root.notFoundComponent />
</Root>
```

## Configuring `notFoundComponent`

Attach a `notFoundComponent` to any route to handle not-found errors:

```tsx
export const Route = createFileRoute('/settings')({
  component: () => (
    <div>
      <p>Settings page</p>
      <Outlet />
    </div>
  ),
  notFoundComponent: () => <p>This setting page doesn't exist!</p>,
});
```

Or for missing resources:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId);
    if (!post) throw notFound();
    return { post };
  },
  component: ({ post }) => (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  ),
  notFoundComponent: () => <p>Post not found!</p>,
});
```

## Default Router-Wide Not Found Handling

Provide a default `notFoundComponent` for all routes:

```tsx
const router = createRouter({
  defaultNotFoundComponent: () => (
    <div>
      <p>Not found!</p>
      <Link to="/">Go home</Link>
    </div>
  ),
});
```

> Note: Only routes with children (routes that render an `<Outlet>`) can handle not-found errors.

## Throwing Not Found Errors

Throw `notFound()` in loaders and `beforeLoad` to signal a resource doesn't exist:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId);
    if (!post) throw notFound();
    return { post };
  },
});
```

The error bubbles to the nearest route with a `notFoundComponent` or the root route.

If no component is found, TanStack Router renders a basic `<div>Not Found</div>`. **Always configure at least one `notFoundComponent` at the root or use `defaultNotFoundComponent`.**

> ⚠️ Throwing `notFound()` in `beforeLoad` always triggers the root `notFoundComponent` since `beforeLoad` runs before layout data loads.

## Targeting Specific Routes

Throw a not-found error for a specific parent route:

```tsx
export const Route = createFileRoute('/_pathlessLayout/route-a')({
  loader: async () => {
    throw notFound({ routeId: '/_pathlessLayout' });
  },
});
```

Or target the root route explicitly:

```tsx
import { rootRouteId } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId);
    if (!post) throw notFound({ routeId: rootRouteId });
    return { post };
  },
});
```

## Throwing in Components

Throw not-found errors in components using the `CatchNotFound` component (similar to `CatchBoundary`):

```tsx
export const Route = createFileRoute('/posts/$postId')({
  notFoundComponent: ({ data }) => {
    const { postId } = Route.useParams();
    return <p>Post {postId} not found!</p>;
  },
});
```

> **Recommendation**: Throw errors in loaders instead of components to properly type loader data and prevent flickering.

## Passing Data to `notFoundComponent`

`notFoundComponent` may not have access to `Route.useLoaderData()` depending on where the error was thrown. Use the `data` option instead:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId);
    if (!post) throw notFound({ data: { attempted: true } });
    return { post };
  },
  notFoundComponent: ({ data }) => {
    const { postId } = Route.useParams();
    return <p>Post {postId} not found!</p>;
  },
});
```
