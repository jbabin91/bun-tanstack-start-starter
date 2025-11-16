# Hydration Errors

Hydration mismatches happen when the server-rendered HTML differs from what the client renders during hydration. Common causes include time zones, randomness, responsive-only logic, or feature flags. Prefer deterministic rendering, then progressively enhance.

## Strategy 1: Make server and client match

- Pick deterministic locale/time zone on the server (cookies or `Accept-Language`).
- Compute once on the server and reuse on the client.

```ts
// src/start.ts
const localeTzMiddleware = createMiddleware().server(async ({ next }) => {
  const headerLocale =
    getRequestHeader('accept-language')?.split(',')[0] ?? 'en-US';
  const cookieLocale = getCookie('locale');
  const cookieTz = getCookie('tz');

  const locale = cookieLocale ?? headerLocale;
  const timeZone = cookieTz ?? 'UTC';

  setCookie('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return next({ context: { locale, timeZone } });
});
```

## Strategy 2: Let the client send its environment

Set a cookie from the client to store browser-only data (time zone, preferences):

```tsx
function SetTimeZoneCookie() {
  React.useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `tz=${tz}; path=/; max-age=31536000`;
  }, []);
  return null;
}
```

Wrap with `<ClientOnly>` or include in your root component.

## Strategy 3: Client-only rendering

Use `<ClientOnly fallback={...}>` for inherently dynamic UI:

```tsx
<ClientOnly fallback={<span>—</span>}>
  <RelativeTime ts={timestamp} />
</ClientOnly>
```

## Strategy 4: Selective SSR

Disable SSR for routes that can’t render deterministically:

```ts
export const Route = createFileRoute('/unstable')({
  ssr: 'data-only', // or false
  component: ExpensiveViz,
});
```

## Strategy 5: Suppress specific nodes

Use `suppressHydrationWarning` only when you know the difference is safe:

```tsx
<time suppressHydrationWarning>{new Date().toLocaleString()}</time>
```

## Checklist

- Store locale/time zone in cookies.
- Avoid `Date.now()`/randomness in SSR output, or guard them.
- Use `ClientOnly` or selective SSR for browser-only components.
- Pass server-computed data to the client via loaders/context.
- Use server functions for true server-only logic.

See also: `execution-model.md`, `server-functions.md`, `selective-ssr.md`.
