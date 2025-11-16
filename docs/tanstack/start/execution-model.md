# TanStack Start Execution Model

TanStack Start is **isomorphic by default**: code runs on both server and client unless you constrain it. Understanding where code executes helps avoid leaking secrets and prevents hydration mismatches.

## Loaders are isomorphic

Route loaders run during SSR **and** on the client during navigation. Never assume they are server-only:

```ts
export const Route = createFileRoute('/products')({
  loader: async () => {
    const response = await fetch('/api/products');
    return response.json();
  },
});
```

If you need server-only work, move it into a server function.

## Environment control APIs

| API                  | Behavior                                        |
| -------------------- | ----------------------------------------------- |
| `createServerFn`     | Server execution, callable from client (RPC)    |
| `createServerOnlyFn` | Throws on client if called                      |
| `createClientOnlyFn` | Throws on server if called                      |
| `createIsomorphicFn` | Provide `.server()`/`.client()` implementations |
| `<ClientOnly>`       | Render children only after hydration            |
| `useHydrated()`      | Returns `true` once client hydration completes  |

Examples:

```ts
const getSecret = createServerOnlyFn(() => process.env.SECRET);
const saveToStorage = createClientOnlyFn((key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
});
```

## Execution guidance

- Treat shared utilities as isomorphic; avoid using `process.env` or browser APIs unless wrapped.
- For environment-specific logic, use `createIsomorphicFn` to provide both implementations.
- Use `ClientOnly` or `useHydrated` when rendering DOM-dependent components to prevent hydration mismatches.
- When accessing secrets or performing DB work, wrap logic in `createServerFn` or `createServerOnlyFn`.
- When interacting with DOM/localStorage, use client-only helpers.

## Progressive enhancement

Design forms/components to work without JS, then enhance with client behavior:

```tsx
<form action="/search" method="get">
  <ClientOnly fallback={<button type="submit">Search</button>}>
    <SearchButton onSearch={handleSearch} />
  </ClientOnly>
</form>
```
