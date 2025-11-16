# Components

These notes describe how to extend or consume the UI primitives under `src/components/ui`.

## Source of truth

- Components mirror the coss ui reference and wrap Base UI primitives (`@base-ui-components/react`). Consult both documentation sets (see `src/components/ui/AGENTS.md`).
- Keep exports copy/paste friendly: each file should export the component(s) and supporting types without app-specific coupling.

## Composition guidelines

- Prefer composition over configuration. Expose slots/children so teams can override structure without editing the file.
- Group Tailwind classes in the order: layout → spacing → color → state (hover/focus/disabled). Use `tailwind-merge` when building class composers.
- Surface critical variants via `class-variance-authority` when helpful, but avoid prop bloat.

## Accessibility

- Preserve Base UI’s keyboard/focus behavior. Never strip ARIA attributes or focus rings; instead, restyle them.
- Form controls should accept `id`, `aria-*`, and `data-*` props and forward refs.

## Testing + examples

- Prefer interactive demos under `src/routes/demo` to showcase usage.
- Add vitest/react-testing-library coverage only when components own logic (e.g., custom state machines).

## Adding new components

1. Generate a new file under `src/components/ui` (kebab-case filename).
2. Start from the Base UI example, wrap with Tailwind styles, and expose friendly props.
3. Update `src/components/ui/index.ts` (if present) or the importing screens.
4. Document noteworthy decisions inline (top-of-file comment) if diverging from upstream guidance.
