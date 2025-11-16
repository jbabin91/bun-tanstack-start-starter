# TanStack Router API Reference

## ActiveLinkOptions type

The `ActiveLinkOptions` type extends the `LinkOptions` type and contains additional options for styling links when they’re active.

```tsx
type ActiveLinkOptions = LinkOptions & {
  activeProps?:
    | React.AnchorHTMLAttributes<HTMLAnchorElement>
    | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
  inactiveProps?:
    | React.AnchorHTMLAttributes<HTMLAnchorElement>
    | (() => React.AnchorHTMLAttributes<HTMLAnchorElement>);
};
```

## AsyncRouteComponent type

Used for code-split route components that expose a `preload()` method.

```tsx
type AsyncRouteComponent<TProps> = SyncRouteComponent<TProps> & {
  preload?: () => Promise<void>;
};
```

## FileRoute class (deprecated)

`FileRoute` instances were used to configure routes before the bundler plugin auto-generated paths. It supports `createRoute` with `RouteOptions` minus `getParentRoute`, `path`, and `id`. Prefer `createFileRoute` instead.

## LinkOptions type

Extends `NavigateOptions` with anchor-specific props.

```tsx
type LinkOptions = NavigateOptions & {
  target?: HTMLAnchorElement['target'];
  activeOptions?: ActiveOptions;
  preload?: false | 'intent';
  preloadDelay?: number;
  disabled?: boolean;
};
```

## LinkProps

Combines `ActiveLinkOptions` with standard anchor attributes. The `children` prop can be static or a render function receiving `{ isActive: boolean }`.

```tsx
type LinkProps = ActiveLinkOptions &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    children?:
      | React.ReactNode
      | ((state: { isActive: boolean }) => React.ReactNode);
  };
```

## MatchRouteOptions

Controls how `useMatchRoute`/`<MatchRoute>` evaluate matches.

```tsx
type MatchRouteOptions = {
  pending?: boolean;
  caseSensitive?: boolean; // deprecated
  includeSearch?: boolean;
  fuzzy?: boolean;
};
```

- `pending`: include transitions in progress
- `caseSensitive`: use route-level settings instead (deprecated)
- `includeSearch`: compare search params
- `fuzzy`: allow `/posts` to match `/posts/123`

## NavigateOptions

Shared by `useNavigate`, `<Navigate>`, and `router.navigate`.

```tsx
type NavigateOptions = ToOptions & {
  replace?: boolean;
  resetScroll?: boolean;
  hashScrollIntoView?: boolean | ScrollIntoViewOptions;
  viewTransition?: boolean | ViewTransitionOptions;
  ignoreBlocker?: boolean;
  reloadDocument?: boolean;
  href?: string;
};
```

- Use `replace` for history.replace
- `resetScroll` defaults to `true`
- `hashScrollIntoView` scrolls elements whose id matches the hash
- `viewTransition` opts into `document.startViewTransition`
- `ignoreBlocker` bypasses transition blockers
- `reloadDocument` triggers full page reload

## ActiveOptions

Configure how `<Link>` determines active state.

```tsx
type ActiveOptions = {
  exact?: boolean;
  includeHash?: boolean;
  includeSearch?: boolean;
  explicitUndefined?: boolean;
};
```

- `exact`: require exact pathname match
- `includeHash`: factor hash
- `includeSearch`: compare search params
- `explicitUndefined`: when `includeSearch` is true, treat `undefined` keys as significant

## Active/inactive props

`activeProps`/`inactiveProps` supply additional props (style, className, etc.) when a link is active/inactive. Styles merge, classNames concatenate, other props override the originals.

## Preloading links

`preload="intent"` starts preloading when the user hovers or touches a link (after an optional `preloadDelay`). Works best with data caching libraries like TanStack Query.

## Data attributes

Links automatically add `data-status="active"` when matched. Use it for CSS selectors if you prefer not to pass props.

## Rendering function children

`<Link>{({ isActive }) => ...}</Link>` exposes the active state to custom link UIs.

## Hash and search helpers

Use `search` and `hash` options instead of interpolating strings. Provide objects/functions to update specific keys while preserving the rest.

## Middleware hooks

Search middleware (configured per route) can transform query params before building URLs or after navigation. Helpers like `retainSearchParams` and `stripSearchParams` make it easy to keep sticky filters or omit defaults.

## Error behaviors

- Throwing in `loader`/`beforeLoad` is caught by the route’s `errorComponent`.
- Throw `redirect(...)` to navigate server-side.
- Throw `notFound()` to render the not-found boundary.

This reference summarizes the most commonly used types and behaviors. See the adjacent docs for routing concepts, navigation patterns, and search param workflows.
