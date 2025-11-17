# Documentation Overview

This folder collects higher-level reference material that complements the in-repo specs and code comments.

- [`getting-started.md`](./getting-started.md) covers environment setup, scripts, and editor tips.
- [`architecture.md`](./architecture.md) explains routing, data fetching, styling, and runtime patterns.
- [`components.md`](./components.md) describes the UI primitives, composition rules, and accessibility expectations.
- TanStack-specific references live under `docs/tanstack/` (router + start).

Each document should capture rationale alongside steps so readers understand why patterns exist, not just how to repeat them.

## Choosing Router vs Start Docs

Use this quick guide to find the right place:

- Router docs (`./tanstack/router/`): Routing primitives, file-based routing, loaders, search params, navigation, matching, SSR concepts.
- Start docs (`./tanstack/start/`): Full-stack topics like SSR controls, hydration, server functions, server routes, middleware, sessions/auth.

If you’re building UI navigation or route loaders, start with Router. If you’re dealing with servers, SSR behavior, or auth/session storage, start with Start.
