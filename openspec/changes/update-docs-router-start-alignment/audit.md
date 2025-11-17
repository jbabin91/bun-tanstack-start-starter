# Docs Audit: Router vs Start

## Scope & Inventory

- Router docs (`docs/tanstack/router/`): 30 files covering routing primitives, loaders, search params, navigation, SSR (conceptual), Query integration, type utilities.
- Start docs (`docs/tanstack/start/`): 12 files covering execution model, server functions, server routes, middleware, selective SSR, hydration errors, error boundaries, auth, databases, observability.
- Root docs: `docs/README.md`, `getting-started.md`, `architecture.md`, `components.md`.

## Overlaps Identified

- SSR topics
  - Router: `ssr.md` (conceptual overview)
  - Start: `selective-ssr.md`, `hydration-errors.md` (practical framework controls)
  - Action: Keep Router high-level; cross-link to Start ✅ DONE
- Authentication & route protection
  - Router: `authenticated-routes.md` (guards via `beforeLoad`, layout routes)
  - Start: `authentication.md`, `authentication-overview.md` (sessions, server functions, vendors)
  - Action: Cross-link both directions ✅ DONE
- Data loading
  - Router: `data-loading.md`, `external-data-loading.md`, `tanstack-query-integration.md`
  - Start: `server-functions.md`, `server-routes.md`
  - Action: Cross-link Router → Start for server functions ✅ DONE
- Execution model & routing lifecycle
  - Router: `routing.md`, `routing-concepts.md`
  - Start: `execution-model.md`
  - Action: Bidirectional cross-links ✅ DONE

## Terminology Alignment

- Router: `loader`, `beforeLoad`, `pendingComponent`, `errorComponent`, `Wrap`, `router.context`
- Start: `server functions`, `server routes`, `middleware`, `shellComponent`, `selective SSR`, `useSession`
- All terminology verified consistent across updated docs ✅

## Completed Work

### Cross-Links Added

- Router `ssr.md` → Start `selective-ssr.md`, `hydration-errors.md`
- Router `authenticated-routes.md` → Start `authentication.md`
- Router `data-loading.md` → Start `server-functions.md`, `error-boundaries.md`
- Router `routing.md` → Start `execution-model.md`
- Start `authentication.md` → Router `authenticated-routes.md`
- Start `overview.md` → Router docs (overview, routing-concepts, file-based-routing, route-trees, data-loading)
- Start `execution-model.md` → Router `routing.md`, `routing-concepts.md`, `data-loading.md`

### Documentation Improvements

- Added "Choosing Router vs Start Docs" section to `docs/README.md` ✅
- Fixed 8 broken internal doc links ✅
- Removed stale references to non-existent `code-splitting.md` ✅
- Created validation script `scripts/validate-docs-links.py` ✅
- All 50 markdown files pass linting ✅

## Validation Results

- **Before**: 8 broken links out of 12 total
- **After**: 0 broken links out of 10 total (2 were removed as stale references)
- **Lint Status**: All 50 markdown files pass markdownlint with 0 errors

## Summary

Documentation alignment complete. Router and Start docs now have clear scopes, consistent terminology, and proper cross-referencing. A validation script ensures ongoing link integrity.
