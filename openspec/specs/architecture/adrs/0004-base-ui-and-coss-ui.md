# ADR 0004: UI Component Strategy — Base UI + COSS UI

- Status: Accepted
- Date: 2025-11-18

## Context

We need accessible, composable UI primitives with predictable styling and minimal runtime cost. The project uses Tailwind CSS v4 and includes `@base-ui-components/react`. We also maintain in-repo UI primitives inspired by popular OSS patterns.

## Decision

Adopt Base UI components for foundational primitives, combined with project-specific (COSS) Tailwind-based components.

- Use `@base-ui-components/react` for accessible, headless primitives
- Compose higher-level components in `src/components/ui` using Tailwind
- Prefer composition over deep theming; keep components framework-agnostic
- Enforce a11y as a non-negotiable (labels, keyboard, aria)

## Consequences

- Strong accessibility baseline and predictable primitives
- Consistent look via Tailwind utilities with minimal custom CSS
- Lower maintenance than building all primitives from scratch

## Alternatives Considered

- Radix UI — similar headless a11y primitives; viable alternative but Base UI fits current needs and bundle profile
- shadcn/ui copies — faster scaffolding but vendor-locks styles and increases code surface
- MUI/Chakra — full design systems; heavier theming/runtime than desired here

## References

- `src/components/ui/`
- Tailwind config and globals in `src/styles/globals.css`
- `@base-ui-components/react` usage
