# Outlets

Nested routing renders parent + child components together. Use `<Outlet />` to mark where child routes should render inside a parent’s layout.

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div>
      <h1>My App</h1>
      <Outlet />
    </div>
  );
}
```

- If a route’s `component` is omitted, TanStack Router automatically renders `<Outlet />` for you.
- Nest outlets at any depth—each child route renders inside its parent’s outlet.
- Layout routes (including pathless layouts) typically render `<Outlet />` to wrap shared UI around children.
