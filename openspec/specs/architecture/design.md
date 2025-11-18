# Architecture Decision Records (mADR)

This is the canonical index for architecture decisions that affect the project across capabilities.

- Location: `openspec/specs/architecture/adrs/`
- Format: mADR (Context, Decision, Consequences), one file per decision
- Numbering: Zero-padded incremental (`0001-`, `0002-`, ...)
- Scope guidance:
  - Cross-cutting decisions → mADR under `adrs/`
  - Change-local decisions → `openspec/changes/<id>/design.md`

## Index

- 0001 — Commit granularity and message body guidelines (see `adrs/0001-commit-granularity-and-bullets.md`)
- 0002 — Adopt TanStack Start + TanStack Router (see `adrs/0002-tanstack-start-and-router.md`)
- 0003 — Adopt TanStack Query for data fetching (see `adrs/0003-tanstack-query.md`)
- 0004 — UI component strategy: Base UI + COSS UI (see `adrs/0004-base-ui-and-coss-ui.md`)

## Authoring Notes

- Keep titles short and action-oriented
- Use present tense for the Decision section
- Link to related specs or proposals when relevant

### How to Create a New ADR

- Start from the template: `adrs/0000-template.md`
- Copy to the next incremental number and rename the file and title
- Set status to `Proposed` (or `Accepted` once approved)
- Add a one-line entry here in the Index
