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

## Authoring Notes

- Keep titles short and action-oriented
- Use present tense for the Decision section
- Link to related specs or proposals when relevant
