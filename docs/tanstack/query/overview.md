# Overview

## What is TanStack Query?

TanStack Query is a data synchronization library for React that manages server state—asynchronous data that originates from a server and needs to be cached, synchronized, and updated on the client.

In this project, we use Query to:

- Fetch data from server functions (TanStack Start)
- Cache responses to avoid redundant network requests
- Prefetch data in route loaders for instant page loads
- Handle background refetching and cache invalidation
- Manage loading/error states declaratively
- Implement mutations with optimistic updates

## Why Query?

Query solves problems that are cumbersome with plain `fetch` or state management:

**Without Query:**

```ts
function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getPostsFn()
      .then(setPosts)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Spinner />
  if (error) return <Error error={error} />
  return <PostsList posts={posts} />
}
```

**With Query:**

```ts
function PostsPage() {
  const { data } = useSuspenseQuery(postsOptions())
  return <PostsList posts={data} />
}
```

Query handles:

- Loading and error states (via Suspense and Error Boundaries)
- Caching (data persists across navigations)
- Background refetching (keeps data fresh automatically)
- Deduplication (multiple components can use same query)
- SSR/hydration (prefetch in loaders, hydrate on client)

## Integration with TanStack Router & Start

### Router: Prefetch in Loaders

Loaders prefetch queries before a route renders:

```ts
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions());
  },
  component: PostsPage,
});
```

- Data loads during route transition, not after component mounts
- useSuspenseQuery in the component accesses cached data instantly
- No loading spinner flicker, better UX

### Start: Server Functions as Query Functions

Server functions handle server-only code (database, environment variables):

```ts
// src/server/posts.ts
export const getPostsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.posts.findMany();
  },
);

// src/lib/query-options/posts.ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
  });
}
```

- Server functions execute on the server (SSR) or via RPC (client)
- Query orchestrates when to call the function, caching, refetching
- Clear separation: server function = data access, Query = orchestration

### Form (Planned): Mutations for Persistence

TanStack Form handles form state, Query handles submission:

```ts
const createPost = useMutation({
  mutationFn: (data) => createPostFn(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
});

const form = useForm({
  onSubmit: async ({ value }) => {
    await createPost.mutateAsync(value);
  },
});
```

- Form: validation, field state, UX
- Mutation: server communication, optimistic updates, cache invalidation

## Core Concepts

### Query Keys

Unique identifiers for queries. Use arrays for hierarchies:

```ts
['posts'][('posts', 1)][('posts', 1, 'comments')]; // All posts // Post with ID 1 // Comments for post 1
```

When you invalidate `['posts']`, all nested keys are also invalidated.

### Query Functions

Async functions that return data:

```ts
queryFn: () => getPostsFn();
```

Query calls this function when:

- Query has no cached data
- Query is stale (past `staleTime`)
- User refetches manually
- Window regains focus (configurable)

### Stale vs Fresh

- **Fresh**: Query is within its `staleTime`, won't refetch automatically
- **Stale**: Query is past `staleTime`, will refetch on next trigger

### Active vs Inactive

- **Active**: At least one component is using the query
- **Inactive**: No components are using the query, cached data can be garbage collected after `gcTime`

## Key Features

### Automatic Background Refetching

Queries refetch in the background when:

- Window regains focus
- Network reconnects
- Query becomes stale and a new consumer mounts

This keeps data synchronized with minimal code.

### Deduplication

If multiple components request the same query at the same time, Query makes only one network request and shares the result.

### Prefetching

Prefetch data before it's needed:

```ts
queryClient.prefetchQuery(postsOptions());
```

When the component renders, data is already cached.

### Suspense Integration

`useSuspenseQuery` throws a promise while loading, integrates with React Suspense:

```tsx
<Suspense fallback={<Spinner />}>
  <PostsPage /> {/* useSuspenseQuery inside */}
</Suspense>
```

No manual loading states needed.

### SSR & Hydration

Prefetch queries on the server, serialize cache, hydrate on the client:

```ts
// Server: prefetch in loader
await queryClient.prefetchQuery(postsOptions());

// Client: useSuspenseQuery reads cache
const { data } = useSuspenseQuery(postsOptions());
```

Data is available instantly on first render.

## Query vs Router Cache

TanStack Router has its own loader caching. When to use which?

**Use Query when:**

- Data needs background refetching (user profiles, notifications)
- Multiple components need the same data
- You want optimistic updates or mutations
- Data should persist across route changes

**Use Router cache (no Query) when:**

- Data is static (site configuration)
- Data is specific to one route and never shared
- No refetching needed

Most dynamic data should use Query for caching and refetching benefits.

## Next Steps

- **[important-defaults.md](./important-defaults.md)** - Understand Query's default behavior
- **[query-options.md](./query-options.md)** ⭐ - Create reusable queryOptions factories
- **[suspense.md](./suspense.md)** ⭐ - Integrate useSuspenseQuery with Router loaders
- **[mutations.md](./mutations.md)** ⭐ - Implement mutations with server functions

## External Resources

- [TanStack Query Official Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query) - Excellent blog series

## Further Reading (Concepts)

- Why You Want React Query: <https://tkdodo.eu/blog/why-you-want-react-query>
- You Might Not Need React Query: <https://tkdodo.eu/blog/you-might-not-need-react-query>
- Thinking in React Query: <https://tkdodo.eu/blog/thinking-in-react-query>
