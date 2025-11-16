# Render Optimizations

TanStack Router includes optimizations to minimize unnecessary re-renders.

## Structural Sharing

TanStack Router uses "structural sharing" to preserve object references between re-renders. This is especially useful for URL-based state like search parameters.

Example: When navigating from `/details?foo=f1&bar=b1` to `/details?foo=f1&bar=b2`:

- `search.foo` remains referentially stable (same reference)
- Only `search.bar` is replaced

```tsx
const search = Route.useSearch();
// search.foo is referentially stable when only bar changes
```

## Fine-Grained Selectors

Subscribe to specific subsets of router state using the `select` property to avoid unnecessary re-renders:

```tsx
// Component only re-renders when `foo` changes, not when `bar` changes
const foo = Route.useSearch({ select: ({ foo }) => foo });
```

### Structural Sharing with Selectors

Selectors can return different values, including objects. However, returning new objects each time causes re-renders:

```tsx
const result = Route.useSearch({
  select: (search) => ({
    foo: search.foo,
    hello: `hello ${search.foo}`,
  }),
}); // Re-renders every time because new object is created
```

Enable structural sharing to prevent this:

#### Enable globally:

```tsx
const router = createRouter({
  routeTree,
  defaultStructuralSharing: true,
});
```

#### Enable per-hook:

```tsx
const result = Route.useSearch({
  select: (search) => ({
    foo: search.foo,
    hello: `hello ${search.foo}`,
  }),
  structuralSharing: true,
});
```

> [!IMPORTANT]
> Structural sharing only works with JSON-compatible data. Cannot use `select` to return class instances if structural sharing is enabled.

TypeScript enforces this:

```tsx
const result = Route.useSearch({
  select: (search) => ({
    date: new Date(), // Error with structural sharing
  }),
  structuralSharing: true,
});
```

Disable per-hook if needed:

```tsx
const result = Route.useSearch({
  select: (search) => ({
    date: new Date(),
  }),
  structuralSharing: false,
});
```
