# Contributing Guidelines

Welcome to the contributing documentation for this TanStack Start project! This directory contains all the information you need to contribute effectively.

## Quick Start

1. **[Development Setup](./development-setup.md)** - Set up your local environment
2. **[Git Conventions](./git-conventions.md)** - Commit message format and workflow
3. **[Coding Standards](./coding-standards.md)** - Code style and best practices

## Documentation Structure

### Essential Guides

- **[Git Conventions](./git-conventions.md)** - Commit format, gitmojis, scopes, validation
- **[Development Setup](./development-setup.md)** - Prerequisites, installation, IDE configuration
- **[Coding Standards](./coding-standards.md)** - TypeScript patterns, React conventions, styling rules

### Workflow Guides

- **[Pull Request Workflow](./pull-request-workflow.md)** - Creating, reviewing, and merging PRs
- **[GitHub Workflow](./github-workflow.md)** - Using MCP tools vs gh CLI for GitHub operations

## Before You Start

### Prerequisites

- **Bun** >= 1.3.2
- **Node.js** >= 22.19.0 (for some tooling)
- **Git** with commit signing configured
- **GitHub CLI** (`gh`) for PR management (optional but recommended)

### First-Time Setup

```bash
# Clone and install
git clone <repo-url>
cd bun-tanstack-start-starter
bun install

# Verify setup
bun --bun vite build
bun run lint
bun run typecheck
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

- Follow [coding standards](./coding-standards.md)
- Write tests for new features
- Update documentation if needed

### 3. Commit Changes

Use conventional commits with gitmojis (see [git conventions](./git-conventions.md)):

```bash
git add .
git commit -m "feat(query): :sparkles: add new query pattern"
```

Not sure how to group your changes? See the [Split-Into-Multiple-Commits Checklist](./git-conventions.md#when-to-split-commits).

### 4. Push and Create PR

```bash
git push origin feat/your-feature-name
gh pr create --fill  # Or use GitHub web interface
```

## Quality Standards

All contributions must pass:

- ✅ **Linting**: `bun run lint` (zero warnings)
- ✅ **Type checking**: `bun run typecheck` (strict mode)
- ✅ **Markdown linting**: `bun run lint:md`
- ✅ **Formatting**: `bun run format:check`
- ✅ **Tests**: `bun test` (if applicable)

Pre-commit hooks automatically run these checks via lefthook.

## Project Structure

```text
docs/
├── contributing/          # This directory
│   ├── README.md         # You are here
│   ├── git-conventions.md
│   ├── development-setup.md
│   ├── coding-standards.md
│   ├── pull-request-workflow.md
│   └── github-workflow.md
├── tanstack/             # TanStack integration docs
│   ├── query/           # Query documentation
│   ├── router/          # Router documentation
│   └── start/           # Start documentation
└── architecture.md       # High-level architecture
```

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/your-org/bun-tanstack-start-starter/discussions)
- **Bug?** [Open an issue](https://github.com/your-org/bun-tanstack-start-starter/issues)
- **Documentation:** Browse [docs/](../)

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Gitmoji Guide](https://gitmoji.dev/)
