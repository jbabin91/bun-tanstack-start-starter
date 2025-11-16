# File Naming Conventions

File-based routing relies on consistent conventions so the bundler can map filenames to route behavior. Here’s a quick reference:

| Pattern       | Meaning                                                      |
| ------------- | ------------------------------------------------------------ |
| `__root.tsx`  | Required root route at project root                          |
| `.` separator | Denote nesting via filenames (`posts.$postId.tsx`)           |
| `$` token     | Dynamic segment (`$postId`)                                  |
| `_` prefix    | Pathless layout route (`_app.tsx`)                           |
| `_` suffix    | Non-nested route (`posts_.$id.tsx`)                          |
| `-` prefix    | Exclude files/folders from routing (for colocated helpers)   |
| `(group)`     | Route group directories (organization only)                  |
| `[x]`         | Escape special characters (`script[.]js.tsx` → `/script.js`) |
| `index` token | Matches parent exactly (configurable `indexToken`)           |
| `.route.tsx`  | Directory route file (configurable `routeToken`)             |

These conventions combine with `routing-concepts.md` to support dynamic params, layouts, pathless wrappers, and more. Adjust tokens via the file-based routing plugin options if needed.
