# Navigation

TanStack Router treats every navigation as relative: you move **from** one route **to** another. You’ll see `from`/`to` pairs across all APIs for consistent type safety.

## Core Interfaces

- `ToOptions`: `{ from?, to, params, search, hash, state }`
- `NavigateOptions`: extends `ToOptions` with SPA-specific flags (`replace`, `resetScroll`, etc.)
- `LinkOptions`: extends `NavigateOptions` with `<a>` props (`target`, `activeOptions`, `preload`, etc.)

## Navigation APIs

- `<Link>`: renders an `<a>` tag with proper `href`. Supports dynamic params, search, hash, `activeProps`, preloading, etc.
- `useNavigate()`: imperative nav (e.g., after a form submission). Returns `navigate(options)`.
- `<Navigate>`: component that triggers navigation on mount.
- `router.navigate()`: imperative nav when you have router access outside React.

## Links

- **Absolute**: `<Link to="/about">About</Link>`
- **Dynamic**: supply `params` for `$` segments

  ```tsx
  <Link to="/posts/$postId" params={{ postId: '123' }}>
    Post 123
  </Link>
  ```

- **Relative**: provide `from` (commonly `Route.fullPath`) or use `to="."`/`to=".."` for current/parent routes.
- **Search updates**: pass `search={{ page: 2 }}` or `search={(prev) => ({ ...prev, page: prev.page + 1 })}`.
- **Optional params**: use `params={{ category: undefined }}` to remove optional segments.
- **Preloading**: `preload="intent"` with optional `preloadDelay`.

## Active State

`activeOptions` controls how links detect active routes (exact match, include hash/search). `activeProps`/`inactiveProps` let you style links based on active state. Links also expose `data-status="active"` and support function children to access `isActive`.

## Search Middlewares

Transform `search` values before building URLs via route-level middlewares (e.g., retain or strip defaults). Helpers like `retainSearchParams(['foo'])` and `stripSearchParams(defaults)` simplify common patterns.

## Match APIs

- `<MatchRoute>` / `useMatchRoute()`: check if a route (plus optional search/hash) is active or pending. Useful for conditional UI (spinners, highlights).

## Tips

- Prefer `<Link>` for user-triggered nav (supports cmd-click, `href`, etc.). Use `useNavigate`/`router.navigate` for side effects.
- Always use `params`, `search`, `hash` fields instead of interpolating strings.
- Optional parameters and search transforms keep URLs clean without losing type safety.
