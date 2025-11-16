# Path Params

Dynamic segments capture URL pieces into a named `params` object. They start with `$`:

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost(params.postId),
  component: PostComponent,
});
```

- Params are available in loaders (`params`) and components (`Route.useParams()` or `useParams({ strict: false })`).
- Child routes inherit parent params.
- Use prefixes/suffixes via `{}` (e.g., `post-{$postId}.txt`).
- Optional params use `{-$param}` and can be set to `undefined` when navigating.
- Wildcards (`/files/$`) populate `params._splat`.
- All path params are validated/typed by TypeScript and support the search/middleware tooling described elsewhere.
