# Search Params

TanStack Router treats search params as structured state. It parses the query string into JSON, lets you validate/transform it, and keeps TypeScript aware of the resulting shape.

## Parsing & Validation

Use `validateSearch` on routes to parse raw search strings into typed objects. You can hand-roll logic or use validators like Zod (`zodValidator`), Valibot, ArkType, or Effect/Schema (via Standard Schema adapters).

```tsx
const searchSchema = z.object({
  page: fallback(z.number(), 1).default(1),
  filter: fallback(z.string(), '').default(''),
});

export const Route = createFileRoute('/shop/products')({
  validateSearch: zodValidator(searchSchema),
});
```

- `fallback` keeps type info while providing defaults.
- Validation errors trigger the route’s `errorComponent` unless you handle them.

## Reading Search

- `Route.useSearch()` in components (typed per route)
- `useSearch({ from: Route.fullPath })` outside route files
- `useSearch({ strict: false })` for optional reads anywhere
- `loader`/`beforeLoad` can read via `routeSearch` or `loaderDeps`

## Writing Search

- `<Link search={{ page: 2 }}>`
- `<Link search={(prev) => ({ ...prev, filter: 'foo' })}>`
- `useNavigate({ search: ... })`
- `<Navigate search={...} />`

Mix with optional params to preserve or remove URL segments cleanly.

## Search Middlewares

Transform search params before building `href`s or when navigating:

- `retainSearchParams(['theme'])`: keep specific keys across links
- `stripSearchParams(defaults)`: omit defaults from URLs
- Provide custom middleware for rewrite logic (e.g., canonical names)

## JSON Features

Nested objects/arrays are stringified safely; first-level keys remain flat so other tooling can still read them. Use TypeScript to enforce shape, and use validation adapters for DX.

## Tips

- Validate search early so downstream code consumes trusted data.
- Use function-style search updates to preserve existing keys.
- Combine with middleware to keep URLs clean but stateful.
