# Route Masking

Route masking allows you to mask the actual URL persisted to the browser's history while navigating to a different route. This is useful for scenarios where you want to display a different URL than the one being matched.

Examples:

- Navigate to `/photo/5/modal` but display `/photos/5` in the address bar
- Navigate to `/post/5/comments` but display `/posts/5`
- Navigate with `?showLogin=true` but display the URL without that param
- Navigate with `?modal=settings` but display `/settings`

## How Route Masking Works

Route masking uses the `location.state` API to store the desired runtime location inside the location written to the URL. It stores this under the `__tempLocation` state property. When the router parses a location with `__tempLocation`, it uses that instead of the URL. The history location is saved in `location.maskedLocation` so the actual URL is always available if needed.

**You don't need to understand these details to use route masking—it's all handled automatically.**

## Using Route Masking

Route masking can be used in two ways:

- **Imperatively**: via the `mask` option in `<Link>` and `navigate()` APIs
- **Declaratively**: via the router's `routeMasks` option

The `mask` option accepts the same navigation object as `<Link>` and `navigate()`. It's fully **type-safe** with TypeScript.

### Imperative Route Masking

Pass a `mask` option to `<Link>` or `navigate()`:

```tsx
<Link
  to="/photos/$photoId/modal"
  params={{ photoId: 5 }}
  mask={{
    to: '/photos/$photoId',
    params: {
      photoId: 5,
    },
  }}
>
  Open Photo
</Link>
```

With `navigate()`:

```tsx
const navigate = useNavigate();

function onOpenPhoto() {
  navigate({
    to: '/photos/$photoId/modal',
    params: { photoId: 5 },
    mask: {
      to: '/photos/$photoId',
      params: {
        photoId: 5,
      },
    },
  });
}
```

### Declarative Route Masking

Use the router's `routeMasks` option to mask routes automatically:

```tsx
import { createRouteMask } from '@tanstack/react-router';

const photoModalToPhotoMask = createRouteMask({
  routeTree,
  from: '/photos/$photoId/modal',
  to: '/photos/$photoId',
  params: (prev) => ({
    photoId: prev.photoId,
  }),
});

const router = createRouter({
  routeTree,
  routeMasks: [photoModalToPhotoMask],
});
```

When creating a route mask, pass:

- `routeTree` - The route tree to apply the mask to
- `from` - The route ID being masked
- `...navigateOptions` - Standard `to`, `search`, `params`, `replace` options

The `createRouteMask` function is **type-safe** and will error on invalid options.

## Unmasking

URLs are automatically unmasked when shared (copied from history) since the masking data is lost outside the local history stack.

### Unmasking on Page Reload

**By default, URLs are NOT unmasked on local page reload** since masking data is stored in `location.state` and persists in the history stack.

To unmask on reload, use (in priority order):

- Set router's `unmaskOnReload: true` option
- Return `unmaskOnReload: true` from `createRouteMask()`
- Pass `unmaskOnReload={true}` to `<Link>` or `navigate()`
