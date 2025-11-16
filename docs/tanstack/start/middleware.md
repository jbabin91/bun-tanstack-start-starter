# TanStack Start Middleware

Middleware customizes both server routes (GET/POST/etc.) and server functions created via `createServerFn`. Middleware is composable and executes dependency-first.

## Types

| Type                       | Scope                                                | Capabilities                                                                               |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Request middleware         | All server requests (SSR, server routes, server fns) | `.server()` hook, can depend on other request middleware                                   |
| Server function middleware | Server functions only                                | `.client()`, `.server()`, `.inputValidator()`, can depend on request + function middleware |

## Request middleware basics

```ts
const loggingMiddleware = createMiddleware().server(async ({ next }) => {
  console.log('incoming request');
  return next();
});
```

Attach to a server route:

```ts
export const Route = createFileRoute('/foo')({
  server: {
    middleware: [loggingMiddleware],
    handlers: {
      GET: () => new Response('ok'),
    },
  },
});
```

## Server function middleware

```ts
const authMiddleware = createMiddleware({ type: 'function' })
  .inputValidator(zodValidator(UserSchema))
  .client(async ({ next }) =>
    next({ headers: { Authorization: `Bearer ...` } }),
  )
  .server(async ({ next, context }) => {
    if (!context.user) throw redirect({ to: '/login' });
    return next();
  });
```

Use with a server function:

```ts
const fn = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => 'secure data');
```

## Composition & context

- Middleware can depend on other middleware via `.middleware([dep])`.
- Call `next({ context, sendContext, headers })` to pass data forward.
- Client middleware can send context to the server (explicit opt-in) and vice versa.

## Global middleware

Configure in `src/start.ts` via `createStart`:

```ts
export const startInstance = createStart(() => ({
  requestMiddleware: [loggingMiddleware],
  functionMiddleware: [authMiddleware],
}));
```

Global middleware applies automatically to every request; add it locally too if you need typed context inference.

## Middleware order

Execution order is global middleware → dependency middleware → local middleware → server function/handler. Use this to layer logging, auth, and request mutation predictably.
