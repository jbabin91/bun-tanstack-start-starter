# Change: Align Router vs Start Documentation

## Why

Router and Start docs overlap on SSR, authentication, and data loading. This causes duplication and confusion. We need clear boundaries, cross-links, and consistent terminology so readers find the most relevant doc quickly.

## What Changes

- Define scopes: Router docs focus on client routing primitives/APIs; Start docs cover full-stack concerns (server functions, SSR controls, middleware, sessions).
- Add cross-links where topics touch both domains:
  - Router → Start: SSR and Authentication
  - Start → Router: Route guards (`beforeLoad`), navigation patterns
- Normalize terminology: “loader”, “beforeLoad”, “server functions”, “server routes”, “shellComponent”, “selective SSR”.
- Avoid duplication: Keep deep SSR controls, hydration, auth sessions in Start; keep routing primitives, loader lifecycle, search params in Router.
- Optional: create an index/landing doc clarifying the split and directing readers.

## Impact

- Affected docs: `docs/tanstack/router/*`, `docs/tanstack/start/*`, `docs/README.md` (optional), and any direct links.
- No code changes. Improves discoverability and reduces maintenance.
