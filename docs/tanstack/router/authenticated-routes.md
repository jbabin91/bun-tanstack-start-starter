# Authenticated Routes

Authentication is a common requirement for protecting routes. TanStack Router provides several patterns for building protected routes and redirecting unauthenticated users.

## Using `route.beforeLoad`

The `route.beforeLoad` function runs before a route loads. It's the ideal place to check authentication and redirect to login if needed.

`beforeLoad` runs before child routes' `beforeLoad` functions, acting as middleware for the route and all children. **If `beforeLoad` throws an error, child routes won't load.**

## Redirecting on Auth Check

Throw a `redirect()` from `beforeLoad` to send users to login:

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
```

> [!TIP]
> The `redirect()` function accepts the same options as `navigate()`, including `replace: true`.

Redirect users back after login:

```tsx
router.history.push(search.redirect);
```

## Non-Redirected Authentication

Keep users on the same page with a login form instead of redirecting:

```tsx
export const Route = createFileRoute('/_authenticated')({
  component: () => {
    if (!isAuthenticated()) {
      return <Login />;
    }

    return <Outlet />;
  },
});
```

This shows the login form while keeping the same URL, then renders child routes once authenticated.

## Authentication with React Context/Hooks

If authentication relies on React context or hooks, pass auth state to the router via `router.context`.

> [!IMPORTANT]
> React hooks cannot be called outside React components. Extract the value in a component wrapping `<RouterProvider />` and pass it via context.

Setup example:

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router';

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
});
```

```tsx
// src/router.tsx
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});
```

```tsx
// src/App.tsx
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from './auth';

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
```

Check auth in routes:

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
```

You can also combine this with the [non-redirected approach](#non-redirected-authentication) to show a login form inline.

## Protecting Multiple Routes

Use a pathless layout route to protect all child routes:

```tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});
```

All routes nested under `/_authenticated` are now protected.

## Examples

See the TanStack Router repository for complete examples:

- [Basic Authentication](https://github.com/TanStack/router/tree/main/examples/react/authenticated-routes) - Simple context-based auth
- [Firebase Authentication](https://github.com/TanStack/router/tree/main/examples/react/authenticated-routes-firebase) - Firebase Auth integration
- [TanStack Start Examples](https://github.com/TanStack/router/tree/main/examples/react) - Various auth patterns with Start
