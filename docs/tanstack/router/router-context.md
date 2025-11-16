# Router Context

TanStack Router's context is a powerful tool for dependency injection and passing data through the route tree. Context is passed through the router and down each matching route, where it can be modified at each level.

## Practical Uses

- **Dependency Injection**: Supply dependencies (loaders, data clients, mutation services) that all routes can access
- **Breadcrumbs**: Store route context at each level to create breadcrumb trails
- **Dynamic Meta Tags**: Attach meta tags to each route's context for dynamic head management
- **Authentication State**: Pass auth data to protect routes and guard loaders

## Typed Router Context

Root router context is strictly typed using `createRootRouteWithContext<YourContextType>()`. This type is merged as context descends the route tree and augmented by each route's `beforeLoad` option.

```tsx
import {
  createRootRouteWithContext,
  createRouter,
} from '@tanstack/react-router';

interface MyRouterContext {
  user: User;
}

const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});

const routeTree = rootRoute.addChildren([
  /* ... */
]);

const router = createRouter({
  routeTree,
});
```

> [!TIP]
> `MyRouterContext` only needs the context passed directly to `createRouter`. Context added in `beforeLoad` is inferred automatically.

## Passing Initial Context

Pass initial context to the router via the `context` option:

> [!TIP]
> If your context has required properties, TypeScript will error if you don't pass them. Optional properties don't require passing context.

```tsx
const router = createRouter({
  routeTree,
  context: {
    user: {
      id: '123',
      name: 'John Doe',
    },
  },
});
```

### Invalidating Context

Call `router.invalidate()` to recompute context when state changes:

```tsx
function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      router.invalidate();
    });

    return unsubscribe;
  }, []);

  return user;
}
```

## Using Context in Routes

Access context in loaders and `beforeLoad`:

```tsx
export const Route = createFileRoute('/todos')({
  component: Todos,
  loader: ({ context }) => fetchTodosByUserId(context.user.id),
});
```

Inject functions and services:

```tsx
const fetchTodosByUserId = async ({ userId }) => {
  const response = await fetch(`/api/todos?userId=${userId}`);
  return response.json();
};

const router = createRouter({
  routeTree,
  context: {
    userId: '123',
    fetchTodosByUserId,
  },
});
```

Then in routes:

```tsx
export const Route = createFileRoute('/todos')({
  loader: ({ context }) => context.fetchTodosByUserId(context.userId),
});
```

### With External Data Libraries

```tsx
interface MyRouterContext {
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});

const queryClient = new QueryClient();

const router = createRouter({
  routeTree: rootRoute,
  context: { queryClient },
});
```

Then in routes:

```tsx
export const Route = createFileRoute('/todos')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ['todos', { userId: user.id }],
      queryFn: fetchTodos,
    });
  },
});
```

## Using React Context and Hooks

React hooks cannot be called in non-React functions like `beforeLoad` or `loader`. Instead, call hooks in a React component, extract the value, and pass it via router context.

Example setup:

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext } from '@tanstack/react-router';
import { useNetworkStrength } from '@/hooks/useNetworkStrength';

interface MyRouterContext {
  networkStrength: ReturnType<typeof useNetworkStrength>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});
```

```tsx
// src/router.tsx
const router = createRouter({
  routeTree,
  context: {
    networkStrength: undefined!, // Set in React-land
  },
});
```

```tsx
// src/main.tsx
import { RouterProvider } from '@tanstack/react-router';
import { useNetworkStrength } from '@/hooks/useNetworkStrength';

function App() {
  const networkStrength = useNetworkStrength();
  return <RouterProvider router={router} context={{ networkStrength }} />;
}
```

Now access in routes:

```tsx
export const Route = createFileRoute('/posts')({
  loader: ({ context }) => {
    if (context.networkStrength === 'STRONG') {
      // Do something
    }
  },
});
```

## Modifying Context

Context is merged as it descends the tree. Each route can modify it via `beforeLoad`:

```tsx
export const Route = createFileRoute('/todos')({
  beforeLoad: () => {
    return {
      bar: true,
    };
  },
  loader: ({ context }) => {
    context.foo; // true (from root)
    context.bar; // true (from this route)
  },
});
```

## Processing Accumulated Context

Use matched routes' contexts to generate breadcrumbs:

```tsx
export const Route = createRootRoute({
  component: () => {
    const matches = useRouterState({ select: (s) => s.matches });

    const breadcrumbs = matches
      .filter((match) => match.context.getTitle)
      .map(({ pathname, context }) => ({
        title: context.getTitle(),
        path: pathname,
      }));

    // ...
  },
});
```

Or generate page titles:

```tsx
export const Route = createRootRoute({
  component: () => {
    const matches = useRouterState({ select: (s) => s.matches });

    const matchWithTitle = [...matches]
      .reverse()
      .find((d) => d.context.getTitle);

    const title = matchWithTitle?.context.getTitle() || 'My App';

    return (
      <html>
        <head>
          <title>{title}</title>
        </head>
        <body>{/* ... */}</body>
      </html>
    );
  },
});
```
