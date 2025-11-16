# Authentication Overview

TanStack Start supports multiple authentication approaches:

- **Hosted platforms**: [Clerk](https://clerk.dev), [WorkOS](https://workos.com), [Better Auth](https://www.better-auth.com) for plug-and-play auth.
- **DIY flows**: Build custom login/logout with server functions and sessions.

Use hosted providers when you need turnkey UI, enterprise SSO, or compliance; roll your own for full control, custom business logic, or to avoid vendor lock-in.

## Architecture basics

- **Server**: verify credentials, manage sessions, store secrets.
- **Client**: read auth state (via context or loaders), display UI, call server functions.
- **Routes**: protect via `beforeLoad` or layout routes (e.g., `/_authed`).

### Session helper

```ts
import { useSession } from '@tanstack/react-start/server';

type SessionData = { userId?: string; email?: string };

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

define login/logout/getCurrentUser via `createServerFn` to keep logic server-side. Route loaders can call `getCurrentUser` to gate access.

See `authentication.md` for full DIY implementation guidelines.
