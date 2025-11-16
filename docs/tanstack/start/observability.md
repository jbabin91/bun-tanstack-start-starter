# Observability

Monitor your TanStack Start app with logging, tracing, and metrics.

## Built-in patterns

- **Server function logging**: wrap handlers with timing/console logs.
- **Request/response middleware**: log request metadata and responses.
- **Client + server error boundaries**: capture errors and `reset()` to retry.
- **Health/metrics routes**: expose `/health` or `/metrics` JSON.

Example request logger:

```ts
const requestLogger = createMiddleware().server(async ({ request, next }) => {
  const start = Date.now();
  try {
    const response = await next();
    console.log(
      `[${request.method}] ${request.url} -> ${response.status} (${Date.now() - start}ms)`,
    );
    return response;
  } catch (error) {
    console.error(`[${request.method}] ${request.url} ERROR`, error);
    throw error;
  }
});
```

## External tools

- **Sentry**: error tracking + performance monitoring.
- **OpenTelemetry**: (experimental) add spans around server functions/middleware.
- **Other APMs**: DataDog, New Relic, Honeycomb, etc.

### Sentry quick start

```ts
// Client entry
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });

// Server function
const riskyFn = createServerFn().handler(async () => {
  try {
    return await doWork();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
});
```

## Best practices

- Never log secrets or PII.
- Use structured logs in production for log aggregation.
- Add rate limiting to error reporting to avoid noise.
- Use `ClientOnly` fallback logging for client-only issues.
- For SSR tracing, wrap `createStartHandler` or `defaultStreamHandler` with instrumentation.
