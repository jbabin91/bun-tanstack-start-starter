# Route Trees

TanStack Router builds a nested tree that matches URLs and renders corresponding component hierarchies. You can define that tree via file-based routing (recommended) or code-based routing. Both support the same features, but file-based routing handles code splitting and type generation automatically.

## Nested Structure

URLs like `/blog/posts/123` typically map to nested components (`<Blog><Posts><Post id="123" />`). File-based routing mirrors this hierarchy through folders or dot-separated filenames.

Example tree:

```sh
routes/
├── __root.tsx
├── index.tsx
├── about.tsx
├── posts/
│   ├── index.tsx
│   ├── $postId.tsx
├── posts.$postId.edit.tsx
├── settings/
│   ├── profile.tsx
│   ├── notifications.tsx
├── _pathlessLayout/
│   ├── route-a.tsx
│   ├── route-b.tsx
├── files/
│   ├── $.tsx
```

## Configuration Styles

- **Flat routes**: use dots to represent nesting (`posts.$postId.tsx`)
- **Directories**: use folders (`posts/$postId.tsx`)
- **Mixed**: combine both for clarity

## Getting Started

Enable file-based routing using the TanStack Router bundler plugin (Vite, Rspack, Webpack, Esbuild) or the Router CLI if your bundler isn’t supported.

During dev/build, the plugin generates `routeTree.gen.ts` automatically. You work in `src/routes/**`, and the router consumes the generated tree.

## Key Concepts

- `__root.tsx` is required (root route).
- Folders or dot notation map to nested routes.
- Special conventions (e.g., `_` prefix, `$` params, `index`) unlock pathless layouts, dynamic segments, etc.—see `routing-concepts.md` and `file-naming.md`.

When the router mounts, it sorts routes to match the most specific ones first (roots → static → dynamic → splats). That ensures consistent behavior regardless of file order.
