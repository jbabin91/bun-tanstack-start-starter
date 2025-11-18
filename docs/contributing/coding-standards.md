# Coding Standards

This document outlines the coding standards and best practices for this TanStack Start project.

## General Principles

- **TypeScript First**: All code should be strongly typed
- **Zero Warnings**: ESLint and TypeScript must have zero warnings
- **Strict Mode**: TypeScript strict mode is enforced
- **Readability**: Code should be self-documenting with clear names
- **Consistency**: Follow established patterns in the codebase

## File Naming Conventions

All files and directories use **kebab-case**:

```text
✅ CORRECT:
user-profile.tsx
query-options.ts
data-fetching.md

❌ INCORRECT:
UserProfile.tsx
queryOptions.ts
DataFetching.md
```

**Exceptions:**

- React components export PascalCase names (but filename is kebab-case)
- Type files: `types.ts` or `index.ts` when appropriate

## Directory Structure

Follow the `modules/` pattern that mirrors `src/`:

```text
modules/
└── user-profile/
    ├── api/              # Server functions, API calls
    ├── components/       # React components
    ├── hooks/            # Custom hooks
    ├── lib/              # Utilities, helpers
    ├── providers/        # Context providers
    └── types/            # TypeScript types
```

See `@/docs/architecture.md` for complete structure guidelines.

## TypeScript

### Type Resolution Hierarchy

When solving type issues, follow this preference order:

1. **Infer**: Let TypeScript infer types naturally
2. **`satisfies`**: Use `value satisfies Type` to validate without widening
3. **`: Type`**: Explicit annotation when inference isn't sufficient
4. **`as Type`**: Type assertion only when you have more context than TypeScript
5. **`as any`**: Never use except in extraordinary circumstances with user approval

### Prefer `type` Over `interface`

```ts
// ✅ GOOD: type aliases
type User = {
  id: number;
  name: string;
};

type UserWithPosts = User & {
  posts: Post[];
};

// ❌ AVOID: interfaces (unless extending)
interface User {
  id: number;
  name: string;
}
```

### No Unused Variables

```ts
// ❌ BAD: unused variable
function fetchUser(id: number) {
  const user = getUser(id);
  return null; // user is unused
}

// ✅ GOOD: all variables used
function fetchUser(id: number) {
  const user = getUser(id);
  return user;
}

// ✅ GOOD: prefix unused params with underscore
function Component({ _unusedProp, usedProp }: Props) {
  return <div>{usedProp}</div>;
}
```

### Strict Equality

Always use `===` and `!==`, never `==` or `!=`:

```ts
// ✅ GOOD
if (value === null) {
}
if (count !== 0) {
}

// ❌ BAD
if (value == null) {
}
if (count != 0) {
}
```

## React Conventions

### Component Structure

```tsx
// ✅ GOOD: Clear component structure
import { type ReactNode } from 'react';

type UserProfileProps = {
  userId: number;
  children?: ReactNode;
};

export function UserProfile({ userId, children }: UserProfileProps) {
  const { data } = useSuspenseQuery(userQueries.detail(userId));

  return (
    <div>
      <h1>{data.name}</h1>
      {children}
    </div>
  );
}
```

### Hooks

- Custom hooks must start with `use`
- Extract complex logic into custom hooks
- Keep components focused on rendering

```ts
// ✅ GOOD: custom hook
export function useUserProfile(userId: number) {
  const { data } = useSuspenseQuery(userQueries.detail(userId));
  const mutation = useMutation(updateUserMutation);

  return { user: data, updateUser: mutation.mutate };
}
```

### Props

- Use `type` for props, not `interface`
- Destructure props in component signature
- Reserve `any` for exceptional cases

## Import Organization

Use `simple-import-sort` plugin (auto-sorted):

```ts
// 1. React and external libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal imports (via @/ alias)
import { userQueries } from '@/lib/query-options/users';
import { Button } from '@/components/ui/button';

// 3. Types (inline type-only imports preferred)
import type { User } from '@/types';
```

**Rules:**

- No parent-relative imports (`../../../`) - use `@/` alias
- No duplicate imports
- Type-only imports inline: `import type { ... }`

## Tailwind CSS

### Class Ordering

Follow `better-tailwindcss` plugin ordering:

```tsx
// ✅ GOOD: ordered classes
<div className="flex items-center gap-4 rounded-lg bg-gray-100 p-4 hover:bg-gray-200">

// ❌ BAD: random order
<div className="p-4 bg-gray-100 flex rounded-lg gap-4 hover:bg-gray-200 items-center">
```

### Avoid Deprecated

Don't use deprecated Tailwind classes:

```tsx
// ❌ BAD: deprecated
<div className="flex-shrink-0">

// ✅ GOOD: modern
<div className="shrink-0">
```

## Error Handling

### Prefer Structured Errors

```ts
// ✅ GOOD: structured error
throw new Error('Failed to fetch user', { cause: error });

// ❌ BAD: string throw
throw 'Failed to fetch user';
```

### No Console Logging (Except Specific Cases)

```ts
// ❌ BAD: console.log in production code
console.log('User data:', user);

// ✅ GOOD: only in specific contexts
// - Environment/database connection logs
// - Test files
// - Development debugging (remove before commit)
```

## Async/Await

### Promise Handling

```ts
// ✅ GOOD: await promises properly
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ❌ BAD: floating promises
function fetchData() {
  fetch('/api/data'); // Promise not awaited
}
```

### Event Handlers

```tsx
// ✅ GOOD: async event handler
<button
  onClick={async () => {
    await mutation.mutateAsync(data);
  }}
>

// ❌ BAD: floating promise
<button onClick={() => mutation.mutateAsync(data)}>
```

## ESLint Rules

Never disable ESLint rules without explicit user confirmation:

```ts
// ❌ BAD: disabling rules
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = 'value';

// ✅ GOOD: fix the underlying issue
// Remove unused variable or prefix with underscore if intentionally unused
```

## Documentation

### Code Comments

- Prefer self-documenting code over comments
- Add comments for complex logic or non-obvious decisions
- Keep comments up-to-date with code changes

```ts
// ✅ GOOD: explains WHY, not WHAT
// Use staleTime: Infinity to prevent background refetches during editing
const { data } = useQuery({
  ...formOptions(id),
  staleTime: Infinity,
});

// ❌ BAD: redundant comment
// Fetch user data
const { data } = useQuery(userOptions(id));
```

### JSDoc (When Needed)

```ts
/**
 * Fetches user profile with optimistic caching.
 *
 * @param userId - The unique user identifier
 * @returns User profile data
 */
export function fetchUserProfile(userId: number): Promise<User> {
  // implementation
}
```

## Testing (When Applicable)

- Write tests for complex logic
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```ts
// ✅ GOOD: descriptive test
test('should refetch when query key changes', async () => {
  // Arrange
  const { result, rerender } = renderHook(
    ({ id }) => useQuery(userQueries.detail(id)),
    { initialProps: { id: 1 } },
  );

  // Act
  rerender({ id: 2 });

  // Assert
  await waitFor(() => expect(result.current.data.id).toBe(2));
});
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/best-practices)
