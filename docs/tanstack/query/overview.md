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

## Why You Want React Query: The 5 Bugs You Avoid

"We just need to fetch data, how hard can it be?" Here's a naive implementation:

```ts
function Bookmarks({ category }: { category: string }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    fetch(`${endpoint}/${category}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) => setError(e));
  }, [category]);

  // Return JSX based on data and error state
}
```

This code has **5 bugs:**

### 1. Race Condition 🏎

Network responses can arrive out of order. If you switch from `books` to `movies`, and the `movies` response arrives before `books`, you'll show `books` data with `movies` selected.

**Fix:** Add an `ignore` flag in the cleanup function:

```ts
useEffect(() => {
  let ignore = false;
  fetch(`${endpoint}/${category}`)
    .then((res) => res.json())
    .then((d) => {
      if (!ignore) setData(d);
    })
    .catch((e) => {
      if (!ignore) setError(e);
    });
  return () => {
    ignore = true;
  };
}, [category]);
```

**With Query:** React Query stores data by QueryKey. When `category` changes, the key changes, so data is always consistent.

### 2. No Loading State 🕐

There's no way to show a pending UI during fetches.

**Fix:** Add `isLoading` state:

```ts
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  let ignore = false;
  setIsLoading(true);
  fetch(`${endpoint}/${category}`)
    .then((res) => res.json())
    .then((d) => {
      if (!ignore) setData(d);
    })
    .catch((e) => {
      if (!ignore) setError(e);
    })
    .finally(() => {
      if (!ignore) setIsLoading(false);
    });
  return () => {
    ignore = true;
  };
}, [category]);
```

**With Query:** `isLoading`, `data`, and `error` are provided automatically with discriminated unions.

### 3. Empty State 🗑️

Initializing `data` with `[]` means you can't distinguish "no data yet" from "no data at all" (empty response).

**Fix:** Initialize with `undefined`:

```ts
const [data, setData] = useState<Item[] | undefined>();
```

**With Query:** Data is `undefined` until the first fetch succeeds, making empty states clear.

### 4. Stale Data & Error Not Reset 🔄

When `category` changes, `data` and `error` from the previous category persist until the new fetch completes. This leads to rendering old errors with new data (or vice versa).

**Fix:** Reset both on each effect run:

```ts
useEffect(() => {
  let ignore = false;
  setIsLoading(true);
  fetch(`${endpoint}/${category}`)
    .then((res) => res.json())
    .then((d) => {
      if (!ignore) {
        setData(d);
        setError(undefined);
      }
    })
    .catch((e) => {
      if (!ignore) {
        setError(e);
        setData(undefined);
      }
    })
    .finally(() => {
      if (!ignore) setIsLoading(false);
    });
  return () => {
    ignore = true;
  };
}, [category]);
```

**With Query:** You never get data/error from a previous category unless you opt into it (e.g., `placeholderData`).

### 5. Fires Twice in StrictMode 🔥🔥

In development, React StrictMode intentionally calls effects twice to find bugs. Your fetch runs twice on mount.

**Fix:** Add another ref workaround (not worth it).

**With Query:** Multiple fetches are efficiently deduplicated. If two components request the same QueryKey simultaneously, only one network request fires.

### Bonus: Error Handling 🚨

`fetch` doesn't reject on HTTP errors. You need to check `res.ok`:

```ts
fetch(`${endpoint}/${category}`).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});
```

**With Query:** Same—you still write this in your `queryFn`. But at least Query handles the promise rejection correctly.

### React Query Fixes All 5 Bugs

The fixed code is 50% larger than the original. With Query:

```ts
function Bookmarks({ category }: { category: string }) {
  const { isLoading, data, error } = useQuery({
    queryKey: ['bookmarks', category],
    queryFn: () =>
      fetch(`${endpoint}/${category}`).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      }),
  });

  // Return JSX based on data and error state
}
```

**Summary of fixes:**

- 🏎️ No race condition (state stored by key)
- 🕐 Loading/error states for free
- 🗑️ Empty states clearly separated
- 🔄 No stale data/error from previous keys
- 🔥 Deduplication handles StrictMode

**Key insight:** Data fetching is simple. Async state management is not. React Query is an async state manager, not a data fetching library.

## When You Might Not Need React Query

### Frameworks with Built-In Solutions

If your framework has first-class data fetching, use it:

**React Server Components (Next.js App Router, TanStack Start with selective SSR):**

```tsx
// Server Component
export default async function Page() {
  const data = await fetch('https://api.github.com/repos/tanstack/react-query');
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

If your data fetching happens exclusively on the server, you don't need client-side cache management.

**Remix loaders:**

```ts
export async function loader() {
  return json({ posts: await db.posts.findMany() });
}
```

Remix handles caching, revalidation, and race conditions via its loader architecture.

### When to Use Query Anyway

Even with Server Components or framework loaders, Query is useful for:

- **Background refetching:** Keep data fresh without explicit user action
- **Infinite scrolling:** Pre-fetch first page on server, fetch more on client
- **Optimistic updates:** Instant UI feedback for mutations
- **Offline support:** Cache data in IndexedDB, sync when online
- **Polling/realtime:** Interval fetching or subscription-based updates
- **Deduplication:** Multiple components sharing the same data

### Hybrid Approach

Combine Server Components with Query:

1. **Prefetch on server:** Load first page of data in RSC or loader
2. **Hydrate on client:** Pass prefetched data to Query cache
3. **Client interactions:** Use `useQuery` for subsequent fetches, `useMutation` for updates

**Example:**

```ts
// Server Component
export default async function PostsPage() {
  const posts = await getPostsFn()
  return (
    <HydrationBoundary state={{ queries: [{ queryKey: ['posts'], data: posts }] }}>
      <PostsList />
    </HydrationBoundary>
  )
}

// Client Component
function PostsList() {
  const { data } = useQuery(postsOptions()) // Reads from hydrated cache
  // ...
}
```

This gives you instant first render (no loading spinner) + all Query features (refetching, mutations, etc.).

### When Not to Use Query

- **Static data:** Site configuration, i18n strings (use framework loaders or bundler imports)
- **Route-specific data that never changes:** Use framework loaders without Query
- **Backend not Node.js and you're happy with a pure SPA:** Query shines here, but if you prefer framework solutions, use them
- **React Native:** TanStack Query works great, but consider native caching solutions if they fit better

### The Tradeoff

Server Components reduce client-side complexity but require:

- Server infrastructure (can't deploy to static hosting)
- Tight integration with a specific framework and bundler
- Careful management of server vs. client boundaries

Query adds client-side complexity but gives you:

- Framework-agnostic caching and refetching
- Background updates without server round-trips
- Optimistic updates and fine-grained cache control
- Works in any React environment (SSR, SPA, React Native)

**There's no free lunch; everything is a tradeoff.** Choose based on your app's needs, not because a tool is "modern" or "old-school."

## Further Reading (Concepts)

- Why You Want React Query: <https://tkdodo.eu/blog/why-you-want-react-query>
- You Might Not Need React Query: <https://tkdodo.eu/blog/you-might-not-need-react-query>
- Thinking in React Query: <https://tkdodo.eu/blog/thinking-in-react-query>
