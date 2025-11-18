# TanStack Start Server Functions

Server functions let you write server-only logic that can be invoked from loaders, components, other server functions, or event handlers with full type safety. They wrap server-only capabilities (database, env vars, filesystem) behind RPC endpoints managed by Start.

## Basic definition

```ts
import { createServerFn } from '@tanstack/react-start';

// Default method = GET
export const getServerTime = createServerFn().handler(async () => {
  return new Date().toISOString();
});

// POST variant
export const saveData = createServerFn({ method: 'POST' }).handler(
  async () => ({ success: true }),
);
```

Call them from loaders, components, or hooks. On the client, the call becomes a `fetch` to the generated endpoint; on the server it runs inline.

## Usage patterns

- **Loaders** for data fetching:

  ```ts
  export const Route = createFileRoute('/posts')({
    loader: () => getPosts(),
  });
  ```

- **Components** via `useServerFn`:

  ```tsx
  const getPosts = useServerFn(getServerPosts);
  const data = await getPosts();
  ```

- **Server composition**: call one server fn from another for modular logic.
- **Event handlers/forms**: use the `.url` property to post forms without JS.

## Input & validation

Server functions accept a single `data` payload. Use validators to ensure runtime safety.

```ts
export const greetUser = createServerFn()
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => `Hello, ${data.name}!`);
```

With Zod:

```ts
const UserSchema = z.object({ name: z.string(), age: z.number().min(0) });
export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(UserSchema)
  .handler(async ({ data }) => data);
```

FormData handling:

```ts
export const submitForm = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error('Expected FormData');
    return {
      name: data.get('name')?.toString() ?? '',
      email: data.get('email')?.toString() ?? '',
    };
  })
  .handler(async ({ data }) => ({ success: true }));
```

## Errors, redirects, not-found

Server functions can throw normal errors, `redirect`, or `notFound` and callers (loaders/components) will receive the serialized result.

```ts
export const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw redirect({ to: '/login' });
  return user;
});
```

Not found example:

```ts
export const getPost = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.post.find(data.id);
    if (!post) throw notFound();
    return post;
  });
```

## Advanced topics

- **Server context**: use `getRequest`, `getRequestHeader`, `setResponseHeader`, etc., inside handlers.
- **Streaming**: stream data back to the client for progressive updates.
- **Raw responses**: return `new Response(...)` for binary or custom types.
- **Progressive enhancement**: use `serverFn.url` with `<form action>` to support no-JS flows.
- **Middleware**: wrap server functions with validation, auth, logging (see middleware doc).
- **Static server functions**: use `staticFunctionMiddleware` to prerender results into JSON assets (experimental).
- **Request cancellation**: consume `abortController.signal` for long operations.

## See Also

- [TanStack Query Overview](../query/overview.md) - Using Query with server functions
- [Query Functions](../query/query-functions.md) - Server function integration patterns
- [Mutations](../query/mutations.md) - useMutation with server functions
- [SSR & Hydration](../query/ssr-hydration.md) - Prefetching server function data
- [Testing](../query/testing.md) - Mocking server functions in tests
