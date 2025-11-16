# Error Boundaries

TanStack Start inherits TanStack Router’s route-level error boundaries. Configure:

- A router-wide default via `defaultErrorComponent`
- Per-route overrides via `errorComponent`
- Custom components that call `reset()` to retry

## Router-wide default

```tsx
// src/router.tsx
import { createRouter, ErrorComponent } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: ({ error, reset }) => (
      <ErrorComponent error={error} reset={reset} />
    ),
  });
}
```

## Per-route override

```tsx
// src/routes/posts.$postId.tsx
import { createFileRoute, ErrorComponent } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

function PostError(props: ErrorComponentProps) {
  return <ErrorComponent {...props} />;
}

export const Route = createFileRoute('/posts/$postId')({
  component: PostComponent,
  errorComponent: PostError,
});
```

### Notes

- `ErrorComponent` is a helper; replace with your own UI.
- `reset()` re-runs the route loader/component after clearing state.
- Throwing from `beforeLoad`/`loader` bubbles into these boundaries.
- Use boundaries for SSR failures, server function errors, or client issues.
