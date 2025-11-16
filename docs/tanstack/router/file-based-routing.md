# File-Based Routing

TanStack Router’s preferred configuration uses the filesystem to express your route tree. You create files under `src/routes`, and the bundler plugin (or CLI) turns them into a typed, code-split route configuration automatically.

## Benefits

- Mirrors URL structure visually
- Automatic code splitting + type generation
- Less boilerplate vs code-based routing
- Consistent conventions across teams

## Directories vs Dot Notation

You can create nested routes via folders or `.` in filenames (or mix both). Choose whichever keeps your tree readable.

### Directory Example

```sh
routes/
├── __root.tsx
├── posts/
│   ├── index.tsx
│   ├── $postId.tsx
│   └── $postId.edit.tsx
└── settings/
    ├── profile.tsx
    └── notifications.tsx
```

### Dot Example

```sh
routes/
├── posts.tsx
├── posts.index.tsx
├── posts.$postId.tsx
├── posts.$postId.edit.tsx
└── settings.profile.tsx
```

### Mixed Example

Combine directories for broad sections and dot routes for narrower ones.

## Naming Conventions

See `file-naming.md` for full rules. Highlights:

- `__root.tsx` is required.
- `index` denotes exact matches for the parent path.
- `$param` captures URL segments.
- `_prefix` creates pathless layouts.
- `-prefix` excludes files/folders (supporting colocated helpers).
- `(group)` organizes routes without affecting paths.
- `[x]` escapes special characters.

## Getting Started

1. Install the TanStack Router bundler plugin (Vite, Rspack, Webpack, Esbuild) or use the CLI.
2. Create route files under `src/routes`.
3. Import the generated `routeTree.gen.ts` into `src/router.tsx` and pass it to `createRouter`.

The plugin watches for new files and regenerates the tree automatically during dev/build.
