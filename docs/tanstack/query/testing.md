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

## Summary

Create a test QueryClient, prefetch when needed, and assert on optimistic UI for fast, deterministic tests.

## Further Reading

- Testing React Query: <https://tkdodo.eu/blog/testing-react-query>
