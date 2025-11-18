# GitHub Copilot Instructions

These instructions help AI assistants work more effectively in this project.

## Terminal Command Best Practices

### ❌ AVOID: Chaining multiple complex commands

```bash
# DON'T: Chain multiple commands with && in a single run_in_terminal call
bun --bun markdownlint-cli2 --fix "file.md" && git add file.md && git commit -m "message"
```

**Problem**: Long command chains can fail to parse properly, get concatenated incorrectly, or have unclear failure points.

### ✅ PREFER: Separate run_in_terminal calls

```bash
# DO: Break into separate calls for better reliability and feedback

# Step 1: Validate/fix
run_in_terminal: bun --bun markdownlint-cli2 --fix "file.md"

# Step 2: Stage (only if step 1 succeeds)
run_in_terminal: git add file.md

# Step 3: Commit (only if step 2 succeeds)
run_in_terminal: git commit -m "type(scope): :emoji: description"
```

**Benefits**:

- Clear feedback at each step
- Easy to identify which step failed
- Can handle long commit messages without truncation
- More reliable terminal output parsing

### When chaining is acceptable

Simple, short commands are fine:

```bash
# OK: Simple navigation
cd /path && ls -la

# OK: Quick check
git status && git log --oneline -1
```

## Commit Message Format

Always use the format from `.commitlintrc.js`:

```text
<type>(<scope>): <gitmoji> <description>

[optional body with bullet points]
```

**Important**:

- Keep the header (first line) under 100 characters
- Use the body for detailed explanations
- **Commit message bodies have length limits too** - keep total message under ~1000 characters
- For large changes affecting multiple areas, create **separate commits per area** instead of one massive commit message
- If a single commit message would be too long, that's a sign to break the work into multiple commits

## File Operations

### Creating files in sequence

When creating multiple related files, use separate `create_file` calls rather than trying to batch them.

### Moving/renaming files

Use `run_in_terminal` with simple `mv` commands, not complex shell scripts.

## Quality Checks

Before committing, always run in this order:

1. `markdownlint-cli2 --fix` (for .md files)
2. `git add <files>`
3. `git commit -m "message"`

The pre-commit hooks will run automatically via lefthook.

## Remember

- **One action per terminal call** for complex operations
- **Validate before staging** (lint, format, typecheck)
- **Stage before committing** (explicit git add)
- **Commit with proper format** (gitmoji, scope, description)
