# Filters

Derive filtered views efficiently using `select` or by encoding filter dimensions in query keys.

## Key-Based Filters

Include filter term in key when it affects server result:

```ts
queryKey: ['posts', 'list', filter];
```

## Client-Side Derived Filters

When server result is the same but view differs, use `select` to derive filtered slices:

```tsx
const { data: open } = useQuery({
  ...postsOptions(),
  select: (all) => all.filter((p) => !p.closed),
});
```

### Transformation Options Comparison

Where you transform data matters:

| Location          | Pros                                     | Cons                                      |
| ----------------- | ---------------------------------------- | ----------------------------------------- |
| **Backend**       | No frontend work                         | Not always possible                       |
| **queryFn**       | Close to data source                     | Runs on every fetch; transformed in cache |
| **Render (hook)** | Flexible                                 | Runs on every render (needs useMemo)      |
| **select option** | Best optimization; partial subscriptions | Structural sharing performed twice        |

### Using select for Transformations

The `select` option is optimal for transformations:

```ts
// ❌ Inline function re-runs every render
useQuery({
  ...todosOptions(),
  select: (data) => data.map((todo) => todo.name.toUpperCase()),
});

// ✅ Stable function reference
const transformTodoNames = (data: Todos) =>
  data.map((todo) => todo.name.toUpperCase());

useQuery({
  ...todosOptions(),
  select: transformTodoNames,
});

// ✅ Or memoize with useCallback
useQuery({
  ...todosOptions(),
  select: React.useCallback(
    (data: Todos) => data.map((todo) => todo.name.toUpperCase()),
    [],
  ),
});
```

### Partial Subscriptions with select

`select` enables subscribing to slices of data, reducing re-renders:

```ts
// Custom hook that accepts optional selector
export const useTodosQuery = (select?: (data: Todos) => any) =>
  useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  });

// Subscribe only to count
export const useTodosCount = () => useTodosQuery((data) => data.length);

// Subscribe to specific todo
export const useTodo = (id: number) =>
  useTodosQuery((data) => data.find((todo) => todo.id === id));
```

When a todo's name changes but the count stays the same, `useTodosCount` won't re-render—only the result of the selector matters.

## Avoid Recompute

Memoize predicates or move heavy work into `select` to leverage structural sharing. The `select` option only runs when data changes or the selector function identity changes.

## Cross-References

- Query keys: `./query-keys.md`
- Render optimizations: `./render-optimizations.md`

## Advanced Select Patterns

### Fine-Grained Subscriptions

React Query has a global QueryCache with fine-grained subscriptions. Each `useQuery` subscribes to its QueryKey (hashed to QueryHash). But what if a single endpoint returns lots of data, and you only care about a slice?

Use `select` to subscribe to derived state:

```tsx
// Subscribe only to product title
function ProductTitle({ id }: Props) {
  const productTitleQuery = useSuspenseQuery({
    ...productOptions(id),
    select: (data) => data.title,
  });

  return <h1>{productTitleQuery.data}</h1>;
}
```

Now the component only re-renders when `title` changes, even if other product fields (like `purchaseCount`) change frequently.

**Structural sharing:** Query applies structural sharing to `select` results, so picking multiple fields works:

```tsx
function Product({ id }: Props) {
  const productQuery = useSuspenseQuery({
    ...productOptions(id),
    select: (data) => ({
      title: data.title,
      description: data.description,
    }),
  });

  return (
    <main>
      <h1>{productQuery.data.title}</h1>
      <p>{productQuery.data.description}</p>
    </main>
  );
}
```

If either field changes, you get a re-render. Otherwise, structural sharing prevents unnecessary renders.

### Typing Select Abstractions

To make `select` optional in a factory:

```ts
const productOptions = <TData = ProductData>(
  id: string,
  select?: (data: ProductData) => TData,
) => {
  return queryOptions({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    select,
  });
};

// Without select: data is ProductData
const query1 = useQuery(productOptions('1'));
//    ^? { data: ProductData | undefined }

// With select: data is string
const query2 = useQuery(productOptions('1', (data) => data.title));
//    ^? { data: string | undefined }
```

The trick: add a type parameter `TData` that defaults to your `queryFn` return type, then define `select` as a function from `ProductData` to `TData`.

### Stabilizing Select with useCallback

Query re-runs `select` when:

1. Data changes (good)
2. The `select` function reference changes (usually bad)

Inline functions are recreated on every render, so `select` re-runs unnecessarily:

```ts
// ❌ Runs on every render
useQuery({
  ...productsOptions(),
  select: (data) => expensiveSuperTransformation(data),
});
```

Stabilize with `useCallback`:

```tsx
// ✅ Stable function reference
function ProductList({ minRating }: Props) {
  const productsQuery = useSuspenseQuery({
    ...productListOptions(),
    select: React.useCallback(
      (data) => expensiveSuperTransformation(data, minRating),
      [minRating],
    ),
  });

  return (
    <ul>
      {productsQuery.data.map((product) => (
        <li key={product.id}>{product.summary}</li>
      ))}
    </ul>
  );
}
```

Now `select` only re-runs when `minRating` changes or `data` changes.

**No dependencies?** Move the function outside the component:

```ts
const select = (data: Array<Product>) => expensiveSuperTransformation(data);

function ProductList() {
  const productsQuery = useSuspenseQuery({
    ...productListOptions(),
    select,
  });
  // ...
}
```

### Memoization Across Observers

`select` runs once per `QueryObserver` (once per `useQuery` call). If you render the same component 3 times, `select` runs 3 times, even with the same `data`.

To deduplicate computation across observers, memoize the transformation:

```ts
import memoize from 'fast-memoize';

const select = memoize((data: Array<Product>) =>
  expensiveSuperTransformation(data),
);

function ProductList() {
  const productsQuery = useSuspenseQuery({
    ...productListOptions(),
    select,
  });
  // ...
}
```

Now if 3 components render, `select` runs 3 times, but `expensiveSuperTransformation` only runs once (cache hit for 2nd and 3rd calls).

**Tradeoff:** Adds dependency on `fast-memoize` and memory overhead. Use only for truly expensive transformations.

## Summary

Encode true data differences in keys; prefer `select` for lightweight client-only filters to minimize cache duplication and re-renders. For fine-grained subscriptions, use `select` to pick slices of data. Stabilize `select` functions with `useCallback` or by moving them outside components. For expensive transformations used by multiple observers, combine `select` with memoization libraries.

## Further Reading

- Data Transformations: <https://tkdodo.eu/blog/react-query-data-transformations>
- Selectors Supercharged: <https://tkdodo.eu/blog/react-query-selectors-supercharged>
