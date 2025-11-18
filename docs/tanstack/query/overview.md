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

## Mental Model: Async State Manager, Not a Data Fetching Library

A common misconception is that React Query fetches data. **It doesn't.** React Query is an async state manager for promises. You provide the promise (via `queryFn`), and Query manages its lifecycle:

- **Caching**: Stores resolved promise values
- **Deduplication**: Shares in-flight promises
- **Background updates**: Refetches when stale
- **Garbage collection**: Removes unused cache entries
- **Optimistic updates**: Updates cache before mutation completes

**What Query doesn't do:**

- Make network requests (you provide the fetching logic)
- Transform responses (unless you use `select`)
- Validate data (that's your queryFn's job)

**Key insight:** Query doesn't care where data comes from—REST, GraphQL, WebSockets, IndexedDB, or even synchronous computations wrapped in `Promise.resolve()`. It manages the promise lifecycle.

### StaleTime is Your Friend

Query defaults to `staleTime: 0`, meaning data is immediately considered stale after fetching. This is aggressive and leads to excessive refetching.

**Default behavior (staleTime: 0):**

- Data refetches on every mount
- Data refetches on every window focus
- Data refetches on every network reconnect

**With staleTime:**

```ts
queryOptions({
  queryKey: ['user'],
  queryFn: getUserFn,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

- Data stays fresh for 5 minutes
- No refetches during that window
- Significant performance improvement

**Guidelines:**

- User profiles: 5-10 minutes
- Reference data (categories, tags): `Infinity` (never refetch automatically)
- Real-time data (live scores): 0 or polling via `refetchInterval`
- Dashboard metrics: 1-2 minutes

**Caution:** Setting `staleTime: Infinity` means data never automatically refetches. You'll need to invalidate manually after mutations or rely on explicit refetch triggers.

### Treat Query Parameters as Dependencies

Query keys work like `useEffect` dependencies—when they change, Query refetches:

```ts
// ✅ Parameters in query key
function useSearchQuery(term: string) {
  return useQuery({
    queryKey: ['search', term],
    queryFn: () => searchFn({ term }),
    enabled: term.length > 0,
  });
}

// Component
function SearchResults() {
  const [term, setTerm] = useState('');
  const { data } = useSearchQuery(term);
  // When term changes, query key changes, Query refetches
}
```

**Don't do this:**

```ts
// ❌ Parameters outside query key
function useSearchQuery() {
  const [term, setTerm] = useState('');
  return useQuery({
    queryKey: ['search'], // Missing term!
    queryFn: () => searchFn({ term }),
  });
}
// Changing term won't trigger refetch, cache will be wrong
```

**Rule:** All variables used in `queryFn` must be in `queryKey`. This ensures cache keys uniquely identify the data.

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

## Practical Tips

### The enabled Option is Powerful

The `enabled` option lets you conditionally execute queries:

```ts
// Wait for user input before querying
useQuery({
  ...searchOptions(term),
  enabled: term.length > 0,
});

// Dependent queries (wait for first query to complete)
const { data: user } = useQuery(userOptions());
const { data: posts } = useQuery({
  ...userPostsOptions(user?.id),
  enabled: !!user?.id,
});

// Pause polling when modal is open
useQuery({
  ...liveDataOptions(),
  refetchInterval: 5000,
  enabled: !isModalOpen,
});
```

Use cases:

- **Dependent queries**: Fetch data in sequence when one depends on another
- **Turn queries on/off**: Pause polling, wait for user action, pause background updates
- **Wait for user input**: Don't query until filter criteria are applied

### Create Custom Hooks

Even for simple queries, custom hooks provide benefits:

```ts
// ✅ Custom hook
export const useUserQuery = () => useQuery(userOptions());

// Component
function UserProfile() {
  const { data } = useUserQuery();
  return <Profile data={data} />;
}
```

Benefits:

- Co-locate data fetching logic with query configuration
- Keep all usages of one query key in a single file
- Easier to add transformations or tweak settings later
- Cleaner component code

### Don't Use queryClient.setQueryData for Local State

`queryClient.setQueryData` is for optimistic updates or writing server data, not local UI state. Background refetches will overwrite manual changes. Use React state, Zustand, or other state management for client-only state.

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
