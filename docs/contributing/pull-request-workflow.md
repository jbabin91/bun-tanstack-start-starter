# Pull Request Workflow

This guide explains how to create and submit pull requests for this TanStack Start project.

## Before Creating a PR

### Quality Checklist

Run all quality checks and ensure they pass:

```bash
# Complete quality check
bun run lint && bun run typecheck && bun run lint:md && bun run build
```

**Individual Checks:**

- [ ] **Linting clean**: `bun run lint` (zero warnings policy)
- [ ] **Types valid**: `bun run typecheck` (strict TypeScript)
- [ ] **Markdown linted**: `bun run lint:md` (if docs changed)
- [ ] **Build succeeds**: `bun run build` (clean build, no errors)
- [ ] **Formatting checked**: `bun run format:check`

### Documentation Updates

If your PR includes:

- **New features** → Update README.md and relevant docs
- **TanStack changes** → Update docs/tanstack/{query,router,start}/
- **Breaking changes** → Add migration guide or notes
- **Configuration changes** → Update relevant documentation

## Creating the PR

### 1. Push Your Branch

```bash
git push origin feat/your-feature-name
```

### 2. Create Pull Request

**Via GitHub CLI (Recommended):**

```bash
gh pr create --fill
```

**Via GitHub Web Interface:**

1. Visit repository on GitHub
2. Click "Compare & pull request"
3. Fill in PR description

### 3. PR Title Format

Use conventional commit format with gitmojis:

```text
<type>(<scope>): <gitmoji> <description>

Examples:
feat(query): :sparkles: add query options factory pattern
fix(router): :bug: handle route prefetch edge case
docs(query): :memo: update mental model section
perf(components): :zap: optimize component renders
refactor(hooks): :recycle: simplify query logic
```

**Types:**

- `feat` - :sparkles: New feature
- `fix` - :bug: Bug fix
- `docs` - :memo: Documentation only
- `style` - :lipstick: Code style/UI changes
- `refactor` - :recycle: Code refactoring
- `perf` - :zap: Performance improvement
- `test` - :white_check_mark: Adding/updating tests
- `chore` - :hammer: Build/tooling changes
- `ci` - :construction_worker: CI/CD changes
- `revert` - :rewind: Revert changes

**Scopes:**

TanStack integrations: `query`, `router`, `start`, `form`, `table`

Project areas: `routes`, `components`, `hooks`, `lib`, `providers`, `styles`

Infrastructure: `config`, `build`, `deps`, `dx`

Documentation: `docs`, `architecture`

### 4. PR Description Template

```markdown
## What Changed

Brief description of the changes (1-2 sentences).

## Why This Change

Explain the motivation:

- Fixes issue #123
- Addresses user need for X
- Improves performance of Y

## Breaking Changes

**⚠️ BREAKING CHANGE** (if applicable)

- What breaks
- How to migrate

## Testing

How to verify these changes:

1. Clone PR branch
2. Run `bun install && bun run build`
3. Start dev server: `bun run dev`
4. Test scenario X
5. Verify behavior Y

## Checklist

- [ ] Documentation updated
- [ ] All quality checks pass
- [ ] No console.log statements (unless in tests/env/db)
- [ ] Types are properly inferred (no excessive `any`)
```

## Code Review Process

### What Reviewers Look For

1. **Functionality**
   - Does it work as intended?
   - Are edge cases handled?
   - Is error handling appropriate?

2. **Code Quality**
   - Follows [coding standards](./coding-standards.md)?
   - Proper TypeScript types (minimal `any` usage)?
   - Clear variable/function names?
   - Uses kebab-case for files/folders?

3. **Documentation**
   - Changes documented in relevant files?
   - Examples provided if applicable?
   - AGENTS.md updated if adding new patterns?

4. **TanStack Integration**
   - Follows Query/Router/Start best practices?
   - Uses queryOptions factories correctly?
   - Proper SSR/hydration handling?

5. **Security**
   - No security vulnerabilities?
   - Input validation present?
   - No hardcoded secrets?

### CI/CD Checks

Your PR must pass:

- ✅ **Pre-commit hooks** - Lint, typecheck, format via lefthook
- ✅ **Commitlint** - Commit message validation
- ✅ **Markdown linting** - All docs pass markdownlint

### Review Timeline

- **First review**: Usually within 24-48 hours
- **Follow-up**: Maintainers will request changes if needed
- **Merge**: After approval + all checks pass

## Responding to Review Comments

### Addressing Feedback

1. **Make requested changes**
2. **Push new commits** (don't force push unless asked)
3. **Reply to comments** with explanations
4. **Mark conversations as resolved** once addressed

### Example Responses

**For code changes:**

> Fixed in commit `abc123`. Changed X to Y as suggested.

**For disagreements:**

> I kept this approach because [reason]. The alternative would cause [issue].
> Happy to discuss further if you have concerns.

**For clarifications:**

> Good catch! I added documentation explaining why this is needed.

## After PR is Merged

### Cleanup

```bash
# Delete local branch
git branch -d feat/your-feature-name

# Delete remote branch
git push origin --delete feat/your-feature-name

# Or use GitHub CLI
gh pr close <number> --delete-branch
```

## Common PR Scenarios

### Draft PRs

For work-in-progress:

```bash
gh pr create --draft
```

Or check "Draft" when creating via web interface.

### Fixing CI Failures

```bash
# Pull latest main
git checkout main
git pull origin main

# Rebase your branch
git checkout feat/your-feature
git rebase main

# Fix conflicts if any, then push
git push --force-with-lease
```

### Updating PR After Review

```bash
# Make changes
git add .
git commit -m "fix(query): :bug: address review feedback"
git push origin feat/your-feature
```

### Squashing Commits (if requested)

```bash
# Interactive rebase
git rebase -i HEAD~3  # Last 3 commits

# Mark commits to squash (change 'pick' to 'squash')
# Save and edit commit message

# Force push
git push --force-with-lease
```

## PR Best Practices

### Keep PRs Small

- ✅ **Ideal**: < 400 lines changed
- ⚠️ **Acceptable**: 400-800 lines
- ❌ **Too large**: > 800 lines (split into multiple PRs)

### One Concern Per PR

```bash
# ✅ GOOD: Focused PR
feat(query): :sparkles: add query options factory

# ❌ BAD: Multiple unrelated changes
feat(query): :sparkles: add factory, refactor hooks, update deps
```

### Self-Review First

Before requesting review:

1. Read your own diff on GitHub
2. Check for debug code, `console.log`, commented code
3. Verify types are properly inferred
4. Ensure documentation is clear
5. Run all quality checks locally

### Clear Commit History

```bash
# ✅ GOOD: Clear progression
feat(query): :sparkles: add query options factory
test(query): :white_check_mark: add factory tests
docs(query): :memo: update factory documentation

# ❌ BAD: Messy history
wip
fix typo
oops
actually fix it
formatting
```

If your history feels muddled, use the [Split-Into-Multiple-Commits Checklist](./git-conventions.md#when-to-split-commits) to regroup related changes before requesting review.

## TanStack-Specific Guidelines

### Query Changes

- Use `queryOptions()` helper for type safety
- Follow hierarchical key structure
- Update relevant query documentation
- Test prefetching in route loaders

### Router Changes

- Test with SSR enabled
- Verify loader/beforeLoad behavior
- Check search param validation
- Update routing documentation

### Start Changes

- Test server functions work SSR + client
- Verify middleware integration
- Check error boundaries
- Update start documentation

## Getting Help

**Questions about PR process?**

- Check [Contributing Guide](./README.md)
- Ask in PR comments
- Open a [Discussion](https://github.com/your-org/bun-tanstack-start-starter/discussions)

**Technical questions?**

- Review [Coding Standards](./coding-standards.md)
- Check [Development Setup](./development-setup.md)
- Read [Git Conventions](./git-conventions.md)

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Gitmoji Guide](https://gitmoji.dev/)
- [GitHub PR Best Practices](https://github.blog/2015-01-21-how-to-write-the-perfect-pull-request/)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/best-practices)
