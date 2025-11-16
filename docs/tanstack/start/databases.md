# Databases

TanStack Start works with any database (SQL, NoSQL, hosted services). Call your database client inside server functions or server routes—those run server-side and keep credentials safe.

## Basic pattern

```ts
import { createServerFn } from '@tanstack/react-start';
import { db } from '../db/client';

export const getUser = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return db.user.findUnique({ where: { id: data.id } });
  });
```

## Recommended providers

a) **Neon** – serverless PostgreSQL with branching, autoscaling, pooling.
b) **Convex** – serverless real-time backend with declarative data model.
c) **Prisma Postgres** – managed Postgres with Prisma tooling.

Use whichever fits your stack; Start’s server functions can integrate with any driver (Prisma, Drizzle, Knex, raw SQL, etc.).

## Tips

- Keep DB code inside server functions/routes to avoid leaking secrets.
- Use connection pooling (Neon, Prisma Accelerate) when deploying serverless.
- Share DB clients via modules to reuse connections.
- For ORMs (Prisma/Drizzle), run migrations separately (CI or scripts).
- Use `createServerOnlyFn` for utility helpers that should never bundle client-side.
