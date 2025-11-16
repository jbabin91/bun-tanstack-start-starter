# Routing Concepts

TanStack Router’s file-based system unlocks powerful routing primitives. This guide explains each concept so you can mix and match them confidently.

## Anatomy of a Route

Use `createFileRoute(path)` for every non-root route. The path argument is auto-generated (via the bundler plugin/CLI) to power type safety.

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: PostsComponent,
});
```

## Root Route

The root route wraps the entire tree, has no path, and always renders. Create it with `createRootRoute()` (or `createRootRouteWithContext`). It can supply loaders, components, search validation, etc.

```tsx
import { createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute();
```

## Basic Routes

Match exact paths (`/about`, `/settings`).

```tsx
export const Route = createFileRoute('/about')({
  component: AboutComponent,
});
```

## Index Routes

Match a parent when no child is selected (trailing slash).

```tsx
export const Route = createFileRoute('/posts/')({
  component: PostsIndexComponent,
});
```

## Dynamic Segments

Prefix with `$` to capture params.

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost(params.postId),
  component: PostComponent,
});
```

## Splat / Catch-all

Use `$` alone to capture remainder (`params._splat`).

```tsx
export const Route = createFileRoute('/files/$')({
  component: FilesComponent,
});
```

## Optional Path Parameters

Wrap with `{-$param}` so segments become optional.

```tsx
export const Route = createFileRoute('/posts/{-$category}')({
  component: PostsComponent,
});
```

See `navigation.md` for handling optional params when linking.

## Layout Routes

Folders or dot-separated names define layouts. Layout routes render their component and an `<Outlet />` for children, letting you wrap sections with shared UI, loaders, or search validation.

## Pathless Layout Routes

Prefix filenames with `_` to create layout behavior without affecting the URL. Useful for grouping or injecting middleware-like logic.

## Non-Nested Routes

Suffix segments with `_` to “break out” of parent nesting. Example: `posts_.$postId.edit.tsx` matches `/posts/$postId/edit` without rendering the parent layout.

## Excluding Files/Folders

Prefix with `-` to colocate helpers without generating routes.

## Route Groups `(folder)`

Wrap folder names in parenthesis to organize files without adding to the URL path.

## Takeaways

- Use folders or dot notation (or mix both) to express nesting.
- Path params, optional segments, splats, and non-nested routes can all coexist.
- Layouts and pathless layouts give you hierarchical control over loaders, search validation, and UI.
- Route groups and excluded files keep your tree manageable while preserving type safety.
