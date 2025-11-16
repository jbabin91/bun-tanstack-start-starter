# UI Components Instructions

- Scope: `src/components/ui` and nested files.
- These components mirror the coss ui library (<https://coss.com/ui>); when creating or modifying a component, reference the official docs linked below to match props, behavior, and accessibility patterns.
- Base each component on the corresponding `@base-ui-components/react` primitive and compose with Tailwind utility classes—avoid bespoke DOM structures unless required.
- Preserve copy/paste friendliness: keep components self-contained, export them via named exports, and avoid coupling to app state.
- Accessibility is non-negotiable: maintain keyboard interactions, ARIA attributes, and focus management from the upstream spec.
- When extending behavior, note the rationale in the component file’s leading comment so downstream users understand deviations from coss ui defaults.
- Preferred references:
  - coss ui overview: <https://coss.com/ui/docs/index.md>
  - coss ui get started: <https://coss.com/ui/docs/get-started.md>
  - coss ui components (Accordion → Tooltip): <https://coss.com/ui/docs/components/[component].md>
  - Base UI quick start: <https://base-ui.com/react/overview/quick-start.md>
  - Base UI components (Accordion → Tooltip): <https://base-ui.com/react/components/[component].md>
  - Base UI handbook (styling/composition/customization): <https://base-ui.com/react/handbook/[topic].md>
- Styling guidelines: follow Tailwind class patterns established in existing files (group interactive states, order layout → color → state classes).
- Tests: add or update stories/examples under demo routes instead of unit tests unless logic warrants it.
