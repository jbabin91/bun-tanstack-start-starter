# Development Environment Setup

This guide will help you set up your local development environment for contributing to this TanStack Start project.

## Prerequisites

### Required

- **Bun** >= 1.3.2 ([Download](https://bun.sh/))
- **Node.js** >= 22.19.0 ([Download](https://nodejs.org/)) - Required for some tooling
- **Git** with commit signing configured

### Recommended

- **VS Code** with ESLint, Prettier, and TypeScript extensions
- **GitHub CLI** (`gh`) for easier PR management

## Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/bun-tanstack-start-starter.git
cd bun-tanstack-start-starter

# 2. Install dependencies
bun install

# 3. Verify setup (all commands must pass)
bun run lint         # ESLint with zero warnings
bun run typecheck    # TypeScript type checking
bun run lint:md      # Markdown linting
bun run build        # Build the project
```

All commands should complete successfully with no errors.

## IDE Configuration

### VS Code (Recommended)

**Required Extensions:**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript and JavaScript Language Features (built-in)

**Recommended Extensions:**

- GitLens (`eamodio.gitlens`)
- Error Lens (`usernamehw.errorlens`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

The project includes pre-configured VS Code settings for consistent development.

### Other IDEs

Ensure your IDE is configured to:

- Use the project's TypeScript version
- Enable ESLint integration
- Format on save with Prettier
- Show type hints and inline errors

## Quality Assurance Commands

These commands MUST pass before committing:

```bash
# Run all quality checks
bun run lint           # ESLint (zero warnings policy)
bun run typecheck      # TypeScript strict mode
bun run lint:md        # Markdown linting
bun run format:check   # Prettier formatting check
```

**Additional Commands:**

```bash
bun run lint:fix       # Auto-fix linting issues
bun run lint:md:fix    # Auto-fix markdown issues
bun run format         # Format code with Prettier
bun run dev            # Development server (port 3000)
bun run build          # Production build
bun run serve          # Preview production build
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write code following [coding standards](./coding-standards.md)
- Add tests for new functionality (if applicable)
- Update documentation if needed

### 3. Run Quality Checks

```bash
# Run all checks
bun run lint && bun run typecheck && bun run lint:md
```

### 4. Commit Changes

Use conventional commit format with gitmojis:

```bash
git add .
git commit -m "feat(query): :sparkles: add new query pattern"
```

See [git conventions](./git-conventions.md) for details.

### 5. Push and Create PR

```bash
git push origin feat/your-feature-name
gh pr create --fill  # Or create PR via GitHub web interface
```

## Testing Your Changes

### Development Server

```bash
# Start dev server on port 3000
bun run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
bun run build

# Preview production build
bun run serve
```

### Type Checking

```bash
# Run TypeScript type checking
bun run typecheck
```

## Troubleshooting

### Dependencies Won't Install

```bash
# Clear bun cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### TypeScript Errors in IDE

```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P) → "TypeScript: Restart TS Server"

# Or verify TypeScript version
bun tsc --version
```

### Git Hooks Not Running

```bash
# Reinstall git hooks
bun run prepare
```

### Lint Errors

```bash
# Auto-fix most issues
bun run lint:fix
bun run lint:md:fix
bun run format
```

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/your-org/bun-tanstack-start-starter/discussions)
- **Bug?** Check existing issues or create a new one
- **Documentation:** Browse [docs/](../README.md)

## Next Steps

- Read [Coding Standards](./coding-standards.md)
- Review [Git Conventions](./git-conventions.md)
- Check [Pull Request Workflow](./pull-request-workflow.md)
