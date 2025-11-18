# ADR 0001: Commit Granularity and Message Bodies

- Status: Accepted
- Date: 2025-11-18

## Context

Recent documentation updates highlighted the need to avoid mass commits, improve commit readability, and prevent terminal issues due to long messages. We standardized headers and constrained bodies to concise bullet points.

## Decision

- Group related changes into focused, revertable commits
- Avoid mass commits across unrelated areas
- Header: ≤ 100 characters, imperative, with gitmoji and scope
- Body (optional): 3–8 concise one-line bullets when additional context is valuable
- Terminal practice: avoid chaining complex commands; validate → stage → commit

## Consequences

- Clearer history that’s easier to review and revert
- Reduced risk of terminal/commit parsing issues
- Encourages smaller, coherent PRs with improved review velocity

## References

- `docs/contributing/git-conventions.md`
- `.github/copilot-instructions.md`
- `docs/contributing/pull-request-workflow.md`
