# Git Commit Conventions

Follow the cz-git configuration from `.commitlintrc.js` with gitmojis enabled.

## Commit Format

```text
<type>(<scope>): <gitmoji> <description>

[optional body]

[optional footer(s)]
```

## Type → Gitmoji Mapping

Based on standard gitmojis and the cz-git configuration:

- **feat**: :sparkles: ✨ - Introduce new features
- **fix**: :bug: 🐛 - Fix a bug
- **docs**: :memo: 📝 - Add or update documentation
- **style**: :lipstick: 💄 - Add or update the UI and style files
- **refactor**: :recycle: ♻️ - Refactor code
- **perf**: :zap: ⚡️ - Improve performance
- **test**: :white_check_mark: ✅ - Add or update tests
- **chore**: :hammer: 🔨 - Add or update development scripts
- **ci**: :construction_worker: 👷 - Add or update CI build system
- **revert**: :rewind: ⏪️ - Revert changes

## Available Scopes

From `.commitlintrc.js` configuration:

### TanStack Integrations

- `query` - TanStack Query (data fetching, caching)
- `router` - TanStack Router (routing, navigation)
- `start` - TanStack Start (SSR, server functions)
- `form` - TanStack Form (form state, validation)
- `table` - TanStack Table (data tables)

### Project Areas

- `routes` - Route definitions and pages
- `components` - React components
- `hooks` - Custom React hooks
- `lib` - Utility libraries
- `providers` - Context providers
- `styles` - Styling and themes

### Infrastructure

- `config` - Configuration files
- `build` - Build system and tooling
- `deps` - Dependencies
- `dx` - Developer experience

### Documentation

- `docs` - Documentation files
- `architecture` - Architecture decisions and guides

## Examples

```bash
# Features
git commit -m "feat(query): :sparkles: add query options factory pattern"
git commit -m "feat(router): :sparkles: implement authenticated route guards"

# Bug fixes
git commit -m "fix(query): :bug: handle stale cache invalidation edge case"
git commit -m "fix(components): :bug: correct button variant styles"

# Documentation
git commit -m "docs(query): :memo: add mental model section to overview"
git commit -m "docs(architecture): :memo: document module structure conventions"

# Chores
git commit -m "chore(deps): :arrow_up: bump @tanstack/react-query to v5.90.10"
git commit -m "chore(config): :hammer: update commitlint and lefthook for bun"

# CI/CD
git commit -m "ci(build): :construction_worker: add automated testing workflow"
git commit -m "ci: :construction_worker: fix release workflow permissions"

# Performance
git commit -m "perf(router): :zap: optimize route prefetching logic"

# Style
git commit -m "style(components): :lipstick: update button hover states"

# Refactor
git commit -m "refactor(hooks): :recycle: extract shared query logic"

# Tests
git commit -m "test(query): :white_check_mark: add unit tests for cache seeding"

# Reverts
git commit -m "revert: :rewind: revert previous commit changes"
```

## Rules Summary

- **Types**: Must be from allowed list (feat, fix, docs, style, refactor, perf, test, chore, ci, revert)
- **Scope**: Optional, lowercase, from predefined list or use 'custom'
- **Subject**: Imperative mood, no period, no sentence case
- **Header**: Max 200 characters
- **Body**: No line length limit
- **Gitmojis**: Always include the appropriate gitmoji code (e.g., :sparkles:)

## Quick Aliases

Configured in `.commitlintrc.js` for common patterns:

- `fd` - `docs: :memo: fix typos`
- `qd` - `docs(query): :memo: update query documentation`
- `rd` - `docs(router): :memo: update router documentation`
- `sd` - `docs(start): :memo: update start documentation`
- `b` - `chore(deps): :arrow_up: bump dependencies`

## Automated Validation

Commits are validated via:

1. **commitlint** - Validates commit message format
2. **lefthook** - Pre-commit hooks that run:
   - Typecheck staged TypeScript files
   - Lint and auto-fix staged code
   - Lint and auto-fix staged markdown
   - Format staged files with Prettier

All hooks configured in `lefthook.yml` and run automatically on commit.

## Troubleshooting

### Commit Hook Failed

If pre-commit hooks fail:

1. Fix the reported issues (lint, format, typecheck errors)
2. Stage the fixed files: `git add .`
3. Retry the commit

Most hooks auto-fix issues and stage them (`stage_fixed: true`), so you may just need to retry.

### Invalid Commit Message

If commitlint rejects your message:

- Check type is from allowed list
- Ensure scope is lowercase
- Don't end subject with a period
- Keep header under 200 characters
- Include the gitmoji code (`:sparkles:` not just ✨)

### Unwanted Co-authored-by Trailer

**Issue**: Very rarely (~0.5% of commits), `Co-authored-by: Claude Code <claude@anthropic.com>` may appear in commit messages despite `.claude/settings.json` having `"includeCoAuthoredBy": false`.

**Cause**: Transient bug in Claude Code CLI (not a configuration issue - the setting works 99.5% of the time).

**Quick Fix**: Amend the last commit to remove it:

```bash
# Remove Co-authored-by from last commit
git log -1 --format=%B | grep -v "Co-authored-by: Claude Code" | git commit --amend -F -
```

**Note**: This is a known issue and does not require changes to your workflow or configuration.
