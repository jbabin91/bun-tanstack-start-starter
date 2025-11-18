# Testing

Test queries and mutations with realistic server behavior and cache lifecycle.

## Tools

- MSW for network mocking
- React Testing Library for component tests
- QueryClient with test-friendly defaults

## Test QueryClient

```ts
function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: 0 },
    },
  });
}
```

## Component Test Example

```tsx
it('renders user profile', async () => {
  const client = createTestClient();
  const ui = (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>
        <UserProfile />
      </Suspense>
    </QueryClientProvider>
  );

  await render(ui);
  await screen.findByText(/John Doe/);
});
```

## Prefetch in Tests

```ts
await client.prefetchQuery(userOptions());
```

Render later; component reads from cache immediately.

## Mutation Test with Optimism

```tsx
it('optimistically adds todo', async () => {
  const client = createTestClient();
  render(
    <QueryClientProvider client={client}>
      <Todos />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole('button', { name: /add/i }));
  expect(screen.getByText(/optimistic text/i)).toBeInTheDocument();
});
```

## Cleanup

```ts
afterEach(() => {
  queryClient.clear();
});
```

## Cross-References

- Mutations: `./mutations.md`
- Suspense: `./suspense.md`
- Factories: `./query-options.md`

## Mock Network Requests with MSW

Use [Mock Service Worker](https://mswjs.io/) instead of mocking fetch/axios:

```ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, title: 'Test Todo' }]));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Benefits:

- Works in Node (tests), Storybook, and browser (development)
- Single source of truth for API mocking
- Supports REST and GraphQL
- Real network requests visible in DevTools

## QueryClientProvider Setup

Create a fresh `QueryClient` for each test to avoid shared state:

```ts
// ✅ Custom hooks wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Turn off retries
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test('my custom hook', async () => {
  const { result } = renderHook(() => useCustomHook(), {
    wrapper: createWrapper(),
  });
});
```

```tsx
// ✅ Component wrapper helper
function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}
```

## Turn Off Retries

Default 3 retries with exponential backoff can cause test timeouts. Disable in test client:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});
```

If specific queries set `retry` explicitly, they override defaults. Use `setQueryDefaults` instead:

```ts
// ❌ Can't override in tests
const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: 5, // Hardcoded
});

// ✅ Can override via defaults
queryClient.setQueryDefaults(['todos'], { retry: 5 });
```

## Always Await Async State

Queries are async—wait for success state before assertions:

```tsx
import { waitFor } from '@testing-library/react';

test('loads user data', async () => {
  const { result } = renderHook(() => useUser(), {
    wrapper: createWrapper(),
  });

  // ✅ Wait until query succeeds
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## Summary

Mock server with MSW, isolate QueryClients per test, disable retries, always await async states. See [TkDodo's testing repo](https://github.com/TkDodo/testing-react-query) for complete examples.

## Further Reading

- Testing React Query: <https://tkdodo.eu/blog/testing-react-query>
