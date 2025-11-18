# ADR 0006: Tailwind CSS v4 Adoption

- Status: Accepted
- Date: 2025-11-18

## Context

We need a utility-first styling approach that pairs well with headless UI primitives, keeps CSS surface area small, and integrates with Vite/React. The project already uses Tailwind CSS v4, the Tailwind Vite plugin, and Prettier Tailwind plugin.

## Decision

Adopt Tailwind CSS v4 as the primary styling system.

- Use utility classes for most styling; minimize bespoke CSS
- Keep styles in `src/styles/globals.css`; prefer utilities over custom classes
- Use `@tailwindcss/vite` for build integration
- Enforce consistent class ordering via `prettier-plugin-tailwindcss`
- Prefer composition in `src/components/ui` over deep theming

## Consequences

- Consistent styling conventions, low CSS maintenance
- Great DX with instant feedback and predictable class utilities
- Potentially verbose class lists; mitigated by component composition and variants

## Alternatives Considered

- CSS-in-JS (styled-components, emotion) — dynamic styling but runtime overhead and theming complexity
- vanilla-extract — type-safe CSS, but more boilerplate and less ergonomic for rapid UI work
- UnoCSS/Windi — similar utility approach; Tailwind's ecosystem and docs favored here

## References

- `src/styles/globals.css`
- `package.json` (Tailwind Vite plugin and Prettier plugin)
- `src/components/ui/` usage
