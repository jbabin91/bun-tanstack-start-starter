# Static Route Data

Routes can optionally specify a `staticData` property containing any synchronously available data. This data is accessible from the route and from any match via `match.staticData`.

## Example

```tsx
// src/routes/posts.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts')({
  staticData: {
    customData: 'Hello!',
  },
});
```

Access static data from matches:

```tsx
// src/routes/__root.tsx
import { createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => {
    const matches = useMatches();

    return (
      <div>
        {matches.map((match) => (
          <div key={match.id}>{match.staticData.customData}</div>
        ))}
      </div>
    );
  },
});
```

## Enforcing Static Data

Use declaration merging to enforce that routes have specific static data:

```tsx
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    customData: string;
  }
}
```

Now TypeScript will require `customData` on all routes:

```tsx
export const Route = createFileRoute('/posts')({
  staticData: {
    // Error: Property 'customData' is missing
  },
});
```

## Optional Static Data

Make static data optional by adding `?`:

```tsx
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    customData?: string;
  }
}
```

As long as there are required properties, you must pass an object.
