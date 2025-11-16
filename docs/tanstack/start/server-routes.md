# Server Routes

Server routes let you define server-side endpoints directly alongside your TanStack Router routes. They handle raw HTTP requests, form submissions, auth workflows, webhooks, and more—all using the same file-based conventions.

## Basic example

```ts
// routes/hello.ts
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response('Hello, World! from ' + request.url);
      },
    },
  },
});
```

## API-style endpoint

```ts
export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async () => Response.json('Hello, World!'),
    },
  },
});
```

## Shared route + handlers

```tsx
// routes/hello.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        return new Response(
          JSON.stringify({ message: `Hello, ${body.name}!` }),
        );
      },
    },
  },
  component: HelloComponent,
});

function HelloComponent() {
  const [reply, setReply] = useState('');
  return (
    <button
      onClick={() => {
        fetch('/hello', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Tanner' }),
        })
          .then((res) => res.json())
          .then((data) => setReply(data.message));
      }}
    >
      Say Hello
    </button>
  );
}
```

## Conventions & paths

Server routes follow TanStack Router’s file-based rules:

- `routes/users.ts` → `/users`
- `routes/users/$id.ts` → `/users/$id`
- `routes/users/$id/posts.ts` → `/users/$id/posts`
- `routes/users.$id.posts.ts` → `/users/$id/posts`
- `routes/api/file/$.ts` → `/api/file/$`
- `routes/my-script[.]js.ts` → `/my-script.js`

Only one file can own a path; duplicates throw during build.

## Middleware + layout routes

Pathless layout routes and breakout routes work, letting you attach middleware to groups of server routes just like app routes.

## Handlers & context

Each handler receives `{ request, params, context }`. You can return `Response` or use helpers like `json()`.

### Simple handler

```ts
export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => new Response('Hello'),
    },
  },
});
```

### Handler-specific middleware

```ts
export const Route = createFileRoute('/hello')({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: {
          middleware: [loggerMiddleware],
          handler: async ({ request }) => new Response('Hello'),
        },
      }),
  },
});
```

### Route-level middleware

```ts
export const Route = createFileRoute('/hello')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => new Response('Hello'),
      POST: async () => new Response('Hi'),
    },
  },
});
```

Route-level middleware runs before handler-specific middleware.

## Dynamic params & splats

```ts
// routes/users/$id.ts
export const Route = createFileRoute('/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => new Response(`User ID: ${params.id}`),
    },
  },
});
```

Splats capture the rest of the path:

```ts
export const Route = createFileRoute('/file/$')({
  server: {
    handlers: {
      GET: async ({ params }) => new Response(`File: ${params._splat}`),
    },
  },
});
```

## Bodies, JSON, headers

```ts
export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        return new Response(`Hello, ${body.name}!`, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
```

Or use helpers:

```ts
import { json } from '@tanstack/react-start';
return json({ message: 'Hello' });
```

Set status codes via `Response` options.

## Engine integration

Start’s server handler (or your custom `createStartHandler`) automatically matches requests to server routes, runs middleware, and executes the correct handler. See the upstream docs for deeper details.
