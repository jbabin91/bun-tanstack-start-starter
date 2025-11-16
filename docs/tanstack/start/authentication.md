# Authentication

This guide shows how to implement DIY authentication in TanStack Start using server functions, secure sessions, and route protection. For vendor options (Clerk, WorkOS, Better Auth), see `authentication-overview.md`.

## Core building blocks

1. **Server functions** for login, logout, fetch current user.
2. **Sessions** (HTTP-only cookies) to store `userId`, role, etc.
3. **Route guards** using layout routes + `beforeLoad`.
4. **Client context/hooks** to consume user state.

### Session helper

```ts
// src/utils/session.ts
import { useSession } from '@tanstack/react-start/server';

type SessionData = {
  userId?: string;
  email?: string;
  role?: string;
};

export function useAppSession() {
  return useSession<SessionData>({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
```

### Server functions

```ts
// src/server/auth.ts
import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router';
import { useAppSession } from '../utils/session';

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await authenticateUser(data.email, data.password);
    if (!user) return { error: 'Invalid credentials' };

    const session = await useAppSession();
    await session.update({ userId: user.id, email: user.email });
    throw redirect({ to: '/dashboard' });
  });

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: '/' });
});

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession();
    if (!session.data.userId) return null;
    return getUserById(session.data.userId);
  },
);
```

### Route protection

```ts
// src/routes/_authed.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { getCurrentUserFn } from '../server/auth';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();
    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    return { user };
  },
});
```

Child routes under `/_authed` inherit the context and stay protected by default.

### Client usage

Use `useServerFn(getCurrentUserFn)` or context to access user info. For mutations, call `loginFn`/`logoutFn` via `useServerFn` or forms pointing to `loginFn.url`.

## Best practices

- Hash passwords with bcrypt/scrypt/argon2.
- Rate limit login attempts (use middleware or Redis).
- Keep secrets in server-only code; never expose them via loaders/components.
- Validate inputs with Zod or custom validators.
- Use roles/permissions via session data + helper functions.

## Examples

- [start-basic-auth](https://github.com/TanStack/router/tree/main/examples/react/start-basic-auth)
- [start-clerk-basic](https://github.com/TanStack/router/tree/main/examples/react/start-clerk-basic)
- [start-workos](https://github.com/TanStack/router/tree/main/examples/react/start-workos)
