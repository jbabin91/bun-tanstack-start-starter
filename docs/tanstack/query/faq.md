# FAQ

## Does TanStack Query replace Redux/MobX?

No. Query manages server state (fetched, cached, synchronized) while Redux/MobX manage client state (UI, local-only data). Use Query for remote data and a minimal client-state solution for local concerns.

## How can I pass parameters to refetch?

You can't—and you shouldn't want to. Embrace the declarative approach: put parameters in the query key and let React Query handle refetching automatically when they change.

```tsx
// ❌ Imperative (doesn't work)
const { refetch } = useQuery({
  queryKey: ['item'],
  queryFn: () => fetchItem({ id: 1 }),
});
refetch({ id: 2 }); // Can't do this

// ✅ Declarative (correct)
const [id, setId] = useState(1);
const { data } = useQuery({
  queryKey: ['item', id],
  queryFn: () => fetchItem({ id }),
});
setId(2); // Query automatically refetches with new key
```

**Why this matters**: Different parameters = different data. Caching under the same key would overwrite previous data. Query keys define dependencies—change the key to trigger new fetches.

**Loading states**: Use `placeholderData: keepPreviousData` to show previous data while new data loads:

```tsx
import { keepPreviousData } from '@tanstack/react-query';

const { data, isPlaceholderData } = useQuery({
  queryKey: ['item', id],
  queryFn: () => fetchItem({ id }),
  placeholderData: keepPreviousData,
});
```

## Why are my updates not shown?

### Query Keys Not Matching

Keys must match exactly when calling `queryClient.setQueryData`. Type mismatches break equality:

```tsx
['item', '1'][('item', 1)]; // string // number - different key!
```

Use TypeScript and query key factories to avoid these bugs. Check React Query Devtools to see exact keys.

### QueryClient Not Stable

Creating `QueryClient` inside a component that re-renders will destroy the cache:

```tsx
// ❌ Cache lost on every render
export default function App() {
  const queryClient = new QueryClient(); // Bad!
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}

// ✅ Stable reference
const queryClient = new QueryClient(); // Outside component
export default function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}

// ✅ useState for one-time init if needed inside component
export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}
```

## Why should I use useQueryClient() instead of importing?

### 1. useQuery uses it too

`useQuery` calls `useQueryClient` internally. If you import a different client directly, you'll have hard-to-trace bugs where the client you import differs from the one in context.

### 2. Decoupling

Context-based dependency injection lets you swap clients for testing (e.g., disable retries) without changing production code.

### 3. Sometimes you can't export

SSR, microfrontends, or using other hooks in client setup require creating the client inside the App. `useQueryClient` keeps your code flexible:

```tsx
export default function App() {
  const toast = useToast();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => toast.show({ type: 'error', error }),
        }),
      }),
  );
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}
```

## When should I use Router loader cache vs Query?

- Router loader cache: Truly static or route-local data with no refetching needs
- Query: Shared data across routes, background refetching, mutations, optimistic updates

## How do I avoid double fetching with SSR?

Use identical factories in loader (`prefetchQuery(factory())`) and component (`useSuspenseQuery(factory())`). Ensure query keys and options match exactly.

## Should I invalidate or use setQueryData after mutations?

Prefer `setQueryData` when the change is small and predictable (append, update fields). Invalidate when impact spans many queries or is complex to merge.

## Can I use Query without Suspense?

Yes. Use `useQuery` and handle `isLoading`/`error`. For loader-prefetched pages, `useSuspenseQuery` simplifies components.

## How to persist cache across sessions?

Use Query persistors (not configured here) to save the cache to storage and restore on load—be mindful of data freshness and invalidation.

## Why do I not get errors?

### fetch API doesn't throw

The native `fetch` API only rejects for network errors, not 4xx/5xx status codes:

```tsx
// ❌ 4xx/5xx don't trigger error state
queryFn: async () => {
  const response = await fetch('/todos/' + todoId);
  return response.json();
};

// ✅ Check response.ok
queryFn: async () => {
  const response = await fetch('/todos/' + todoId);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
```

Libraries like axios and ky handle this automatically.

### Logging without re-throwing

```tsx
// ❌ Catches error but doesn't re-throw
queryFn: async () => {
  try {
    const { data } = await axios.get('/todos/' + todoId);
    return data;
  } catch (error) {
    console.error(error);
    // Returns undefined, not a rejected Promise!
  }
};

// ✅ Re-throw after logging
queryFn: async () => {
  try {
    const { data } = await axios.get('/todos/' + todoId);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
```

Prefer global `onError` callback on QueryCache for logging instead.

## Why is my queryFn not called?

### initialData + staleTime

`initialData` is treated as fresh cache data. With `staleTime`, React Query won't refetch until data becomes stale:

```tsx
// ❌ initialData seen as fresh for 5 seconds - no background refetch
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  initialData: [],
  staleTime: 5 * 1000,
});

// ✅ Use placeholderData instead (never cached)
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  placeholderData: [],
  staleTime: 5 * 1000,
});

// ✅ Or mark initialData as immediately stale
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  initialData: [],
  initialDataUpdatedAt: 0, // Marks as stale
  staleTime: 5 * 1000,
});
```

### Dynamic keys with initialData

```tsx
// ❌ initialData applies to ALL pages
const [page, setPage] = useState(0);
const { data } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  initialData: initialDataForPageZero,
  staleTime: 5 * 1000,
});

// ✅ Conditionally apply initialData
const [page, setPage] = useState(0);
const { data } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  initialData: page === 0 ? initialDataForPageZero : undefined,
  staleTime: 5 * 1000,
});
```

## How to handle forms?

Use TanStack Form (planned) for field state and validation. Use mutations for server persistence and cache reconciliation.

### Server State vs Client State

Server state becomes client state temporarily while editing. Two approaches:

**1. Simple approach (copy to form state)**:

- Use `defaultValues` in form with server data
- Disable background updates (`staleTime: Infinity`)
- Good for solo editing, single-user forms

```tsx
const { data } = useQuery({
  ...personOptions(id),
  staleTime: Infinity, // No background updates
});

if (!data) return 'loading...';

return <PersonForm defaultValues={data} onSubmit={updatePerson.mutate} />;
```

**2. Controlled fields (keep background updates)**:

- Derive state: use field value if changed, else server state
- Background refetches update untouched fields
- Good for collaborative editing

```tsx
const { data } = useQuery(personOptions(id));
const { control } = useForm();

<Controller
  name="firstName"
  control={control}
  render={({ field }) => (
    <input {...field} value={field.value ?? data.firstName} />
  )}
/>;
```

**Tips**:

- Use `isLoading` from mutation to disable submit button (prevent double submit)
- Reset form after successful mutation + invalidation
- Separate form component for cleaner defaultValues handling

## Is a default query function recommended?

Not in this project. Prefer explicit factories for type safety and clarity.

## Cross-References

- Mutations & invalidation: `./mutations.md`, `./query-invalidation.md`
- SSR & prefetching: `./ssr-hydration.md`, `./prefetching-router.md`
- Factories: `./query-options.md`

## Further Reading

- React Query as a State Manager: <https://tkdodo.eu/blog/react-query-as-a-state-manager>
- React Query FAQs: <https://tkdodo.eu/blog/react-query-fa-qs>
- React Query – The Bad Parts: <https://tkdodo.eu/blog/react-query-the-bad-parts>
