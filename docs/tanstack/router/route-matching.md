# Route Matching

TanStack Router sorts routes by specificity so that the most precise matches win. Even if your files are created in any order, the router internally orders them:

1. Index routes
2. Static routes (longest path first)
3. Dynamic routes (`$param` segments, longest path first)
4. Splat/wildcard routes

Example tree:

```sh
Root
  ├─ blog
  │   ├─ $postId
  │   ├─ /
  │   └─ new
  ├─ /
  ├─ about
  ├─ about/us
  └─ *
```

Sorting results in:

```sh
Root
  ├─ /
  ├─ about/us
  ├─ about
  ├─ blog
  │   ├─ /
  │   ├─ new
  │   └─ $postId
  └─ *
```

Match examples:

- `/blog` → matches `Root > blog > /`
- `/blog/my-post` → matches `Root > blog > $postId`
- `/` → matches `Root > /`
- `/not-a-route` → falls through to `Root > *`

This predictable ordering means you can confidently build route trees without worrying about manual priority adjustments.
