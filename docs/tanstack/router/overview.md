# TanStack Router Overview

TanStack Router provides a type-safe routing system for React (and Solid) with built-in caching, loader orchestration, and file/code routing parity.

## Core capabilities

- Nested, layout, and pathless routes with route masking and SSR support
- Built-in SWR-style caching for loaders plus tight integration with TanStack Query
- First-class JSON search params (parsed, validated, inherited) and URL-state helpers
- Route context inheritance for auth, theming, or data clients

## Design principles

- Configure routes via code or files so TypeScript can infer `to`, params, search, and context types
- Declare the router via module augmentation to propagate types globally
- Prefer file-based routing for scalability; fall back to code-based when necessary

## Practical guidance

- Keep route components/loaders collocated; exporting them prevents auto code splitting
- Use pathless layouts (`_foo.tsx` or `id`) for shared wrappers and context
- Treat search params as persistent state instead of building bespoke global stores
