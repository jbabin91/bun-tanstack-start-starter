# GitHub Workflow

A practical guide for deciding when to use the VS Code MCP GitHub tools vs the `gh` CLI, plus common commands and best practices.

## TL;DR Decision Tree

- Are you doing GitHub actions from inside VS Code with the AI agent?
  - Yes → Prefer MCP GitHub tools (structured, reproducible, tracked)
  - No → Prefer `gh` CLI for fast, interactive commands
- Are you drafting a PR review before submitting?
  - Yes → MCP: Pending Review tools (draft, batch, then submit)
  - No → MCP: Review tools (publish comments) or `gh pr review`
- Need to create/update/merge PRs or sync branches?
  - Prefer MCP: Pull Request Management tools; alternatively `gh pr *`
- Investigating CI failures or re-running jobs?
  - Prefer MCP: Workflow Failure Analysis + Workflow Management
  - Alternatively `gh run view`, `gh run watch`, `gh workflow run`
- Managing issues, discussions, or repo overviews?
  - Prefer MCP: Issue/Alert, Discussion, Repository Overview tools
  - Alternatively `gh issue *`, `gh discussion *` (if enabled)

## When To Use What

### Use MCP GitHub Tools when

- You want the agent to execute and document steps directly in VS Code
- You need structured operations (create/update PRs, request reviews, merge)
- You want to analyze workflow failures with logs summarized by the agent
- You need to avoid shell-specific pitfalls and keep a reproducible history

Tool categories available to the agent:

- Pull Requests: create/update/merge, update branches
- Pending Reviews: draft comments, then submit review
- Reviews: add comments to active discussions
- Workflows: list/rerun jobs, update workflow runs
- Workflow Failures: fetch and summarize failed job logs
- Issues & Alerts: create/update issues, review alerts
- Discussions: list and retrieve discussions
- Repository Overview: branches, releases, advisories

See tool names in code: `activate_pull_request_management_tools`, `activate_pending_review_tools`, `activate_pull_request_review_tools`, `activate_workflow_management_tools`, `activate_workflow_failure_analysis_tools`, `activate_issue_and_alert_management_tools`, `activate_discussion_management_tools`, `activate_repository_overview_tools`.

### Use `gh` CLI when

- You’re working in a terminal and prefer quick, interactive flows
- You need features not exposed by current MCP tools
- You want to script repeatable workflows in CI/local scripts

Authenticate first:

```bash
gh auth login
```

Common commands:

```bash
# PRs
gh pr create --fill
gh pr view --web
gh pr checkout <number|url>
gh pr merge --squash --delete-branch

# Reviews
gh pr review --approve -b "LGTM"

# Runs / Workflows
gh run list
gh run watch <run-id>
gh run view <run-id> --log
gh workflow list
gh workflow run <name.yml>

# Issues / Discussions
gh issue create --title "..." --body "..."
gh issue view <number>
# discussions commands require GitHub Enterprise or feature enablement
```

## Commit & PR Hygiene

- Follow commit rules: `docs/contributing/git-conventions.md`
- Follow PR process: `docs/contributing/pull-request-workflow.md`
- In terminal operations, follow `/.github/copilot-instructions.md` for step-by-step command hygiene

Key points:

- Group related changes; avoid mass commits; aim for revertable steps
- Headers ≤ 100 chars; optional bodies 3–8 concise bullets
- Avoid chaining complex commands; validate → stage → commit

## Typical Flows

- Create a PR
  - MCP: Pull Request Management tools, or
  - CLI: `gh pr create --fill`
- Prepare a review with many comments
  - MCP: Pending Review → add comments → submit review
- Investigate a failing workflow
  - MCP: Workflow Failure Analysis → summarize logs
  - CLI: `gh run view --log`, `gh run watch`
- Merge a green PR
  - MCP: Merge PR (squash/merge/rebase)
  - CLI: `gh pr merge --squash --delete-branch`
- Open an issue and link it to a PR
  - MCP: Issue Management + PR updates
  - CLI: `gh issue create` then reference in PR description

## Troubleshooting

- `gh` auth or permission errors
  - Run `gh auth status`; ensure correct org SSO/token scopes
- Workflow logs too big
  - Use MCP Workflow Failure Analysis to fetch targeted logs
- Reviews not appearing
  - Pending reviews must be submitted; publish to finalize

## References

- Git conventions: `./git-conventions.md`
- PR workflow: `./pull-request-workflow.md`
- Terminal best practices for assistants: `../../.github/copilot-instructions.md`
