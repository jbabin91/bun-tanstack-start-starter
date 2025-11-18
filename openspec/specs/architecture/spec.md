# Architecture Decisions

This capability documents how architecture decisions are recorded and discovered for this project.

## Requirements

### Requirement: Record decisions as mADR entries

The project SHALL record architecture decisions using the mADR format under `openspec/specs/architecture/adrs/` with monotonically increasing numeric prefixes (e.g., `0001-...`).

#### Scenario: Add a new decision

- **WHEN** a cross-cutting or architectural decision is made
- **THEN** create a new file under `openspec/specs/architecture/adrs/NNNN-title.md` following the mADR template
- **AND** update the index in `openspec/specs/architecture/design.md`

### Requirement: Co-locate change-specific decisions

Decisions specific to a single change SHALL be documented in `openspec/changes/<change-id>/design.md` and referenced from the change proposal.

#### Scenario: Decision tied to a proposal

- **WHEN** a decision applies only to a single change proposal
- **THEN** document it in that change’s `design.md`
- **AND** do NOT create a separate ADR unless the decision is cross-cutting
