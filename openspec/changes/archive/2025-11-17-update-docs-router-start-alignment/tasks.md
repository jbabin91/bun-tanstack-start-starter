## 1. Documentation Updates

- [x] Add cross-links:
  - [x] Router `ssr.md` → Start `selective-ssr.md`, `hydration-errors.md`
  - [x] Router `authenticated-routes.md` → Start `authentication.md`
  - [x] Router `data-loading.md` → Start `server-functions.md`
  - [x] Start `authentication.md` → Router `authenticated-routes.md`
  - [x] Router `routing.md` → Start `execution-model.md`
  - [x] Start `execution-model.md` → Router `routing.md`, `routing-concepts.md`, `data-loading.md`
  - [x] Start `overview.md` → Router docs
  - [x] Router `data-loading.md` → Start `error-boundaries.md`
- [x] Verify terminology is consistent across docs
- [x] Add a short "Choosing Router vs Start docs" section to `docs/README.md`

## 2. Cleanup

- [x] Fixed all broken internal doc links (8 broken → 0 broken)
- [x] Removed stale references to non-existent `code-splitting.md`
- [x] Created validation script at `scripts/validate-docs-links.py`
