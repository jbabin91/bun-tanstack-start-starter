# Design: TanStack Query Documentation Structure

## Context

Adding comprehensive TanStack Query documentation for a project using TanStack Start, TanStack Router, and TanStack Form (planned). Need to balance official Query docs with project-specific patterns.

## Goals

- Provide practical, project-specific Query documentation
- Emphasize integration with Router loaders, Start server functions, and Form mutations
- Use queryOptions factories for type-safe, reusable queries
- Document SSR/hydration patterns specific to Start
- Avoid duplication with official docs; focus on "how we use it here"

## Non-Goals

- Replicating complete official TanStack Query docs
- Documenting non-React Query variants (Vue, Solid, Angular)
- Internal Query implementation details

## Documentation Structure

```sh
docs/tanstack/query/
├── AGENTS.md                           # Quick reference for AI assistants
├── overview.md                         # What Query is, why we use it, integration overview
├── important-defaults.md               # Defaults + project conventions
├── queries.md                          # Basic useQuery patterns
├── query-keys.md                       # Key conventions for this project
├── query-functions.md                  # Server function integration
├── query-options.md                    # queryOptions factory pattern ⭐
├── suspense.md                         # useSuspenseQuery + loader integration ⭐
├── parallel-queries.md                 # useQueries patterns
├── dependent-queries.md                # enabled + route param patterns
├── infinite-queries.md                 # Pagination with cursors ⭐
├── paginated-queries.md                # keepPreviousData patterns
├── initial-data.md                     # Hydration from loaders
├── placeholder-data.md                 # Loading state strategies
├── mutations.md                        # useMutation + server functions ⭐
├── optimistic-updates.md               # Cache & UI-based patterns ⭐
├── query-invalidation.md               # invalidateQueries strategies
├── mutation-updates.md                 # setQueryData from mutations
├── ssr-hydration.md                    # prefetchQuery in loaders ⭐
├── advanced-ssr.md                     # Streaming, selective SSR
├── prefetching-router.md               # Prefetch on route preload ⭐
├── performance.md                      # Waterfalls, select, structural sharing
├── render-optimizations.md             # notifyOnChangeProps, fine-grained updates
├── network-mode.md                     # online/always/offlineFirst
├── background-fetching.md              # isFetching indicators
├── window-focus-refetching.md          # Configuration
├── disabling-queries.md                # enabled option patterns
├── query-retries.md                    # retry + retryDelay
├── query-cancellation.md               # AbortController with routes
├── scroll-restoration.md               # Router integration
├── filters.md                          # Query filtering utilities
├── default-query-function.md           # Global defaults (if used)
├── testing.md                          # MSW, loader tests
└── faq.md                              # Redux/MobX comparison, pitfalls
```

## Key Integration Patterns

### 1. queryOptions Factory Pattern

**Decision:** Use queryOptions for all reusable queries

```ts
// src/lib/query-options/posts.ts
import { queryOptions } from '@tanstack/react-query';
import { getPostsFn } from '@/server/posts';

export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function postOptions(id: number) {
  return queryOptions({
    queryKey: ['posts', id],
    queryFn: () => getPostFn(id),
    staleTime: 5 * 60 * 1000,
  });
}
```

**Rationale:**

- Type inference works across useQuery, prefetchQuery, getQueryData
- Centralized query configuration
- Easy to reuse in loaders and components

### 2. Loader + Query Integration

**Decision:** Prefetch in loaders, consume with useSuspenseQuery in components

```ts
// src/routes/posts/index.tsx
export const Route = createFileRoute('/posts/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(postsOptions())
  },
  component: PostsPage,
})

function PostsPage() {
  const { data } = useSuspenseQuery(postsOptions())
  return <PostsList posts={data} />
}
```

**Rationale:**

- Data loads before route renders (no suspense flicker)
- useSuspenseQuery guarantees data is defined
- Query cache handles deduplication if already fetched

### 3. Server Function Integration

**Decision:** Keep server functions in `src/server/`, call from queryFn

```ts
// src/server/posts.ts
import { createServerFn } from '@tanstack/react-start';

export const getPostsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    // DB access here
    return db.posts.findMany();
  },
);

// src/lib/query-options/posts.ts
export function postsOptions() {
  return queryOptions({
    queryKey: ['posts'],
    queryFn: () => getPostsFn(), // Server function as queryFn
  });
}
```

**Rationale:**

- Server functions handle server-only code (DB, env vars)
- Query handles caching, deduplication, refetching
- Clear separation: server = data access, query = client orchestration

### 4. Mutation + Form Integration (Planned)

**Decision:** Use TanStack Form for form state, useMutation for submission

```ts
// Future pattern with TanStack Form
function PostForm() {
  const queryClient = useQueryClient()

  const createPost = useMutation({
    mutationFn: (data) => createPostFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const form = useForm({
    defaultValues: { title: '', content: '' },
    onSubmit: async ({ value }) => {
      await createPost.mutateAsync(value)
    },
  })

  return <form.Provider>...</form.Provider>
}
```

**Rationale:**

- Form handles validation, field state, UX
- Mutation handles server communication, optimistic updates
- Separation of concerns: form = input, mutation = persistence

### 5. Infinite Query + Search Params

**Decision:** Store cursor in URL search params for shareable pagination

```ts
export const Route = createFileRoute('/posts/')({
  validateSearch: z.object({
    cursor: z.number().optional(),
  }),
})

function PostsPage() {
  const { cursor } = Route.useSearch()
  const navigate = useNavigate()

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => getPostsFn({ cursor: pageParam }),
    initialPageParam: cursor ?? 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return (
    <>
      {data.pages.map(/* render */)}
      <button onClick={() => fetchNextPage()}>Load More</button>
    </>
  )
}
```

**Rationale:**

- URL reflects pagination state (shareable, back button works)
- Query cache handles already-loaded pages
- Router search params integrate with infinite query state

## Documentation Writing Principles

1. **Show, don't tell:** Lead with code examples, explain after
2. **Project context first:** "In this project, we..." not "TanStack Query supports..."
3. **Integration focus:** Always show how Query works with Router/Start/Form
4. **Practical patterns:** Real project examples, not abstract demos
5. **Cross-link aggressively:** Connect related Router, Start, Query docs
6. **Assume familiarity:** Reader knows React/TypeScript, don't explain basics
7. **Mark as ⭐ critical topics:** queryOptions, suspense, mutations, SSR, infinite queries

## Documentation Tone

- Concise, direct
- Assume smart reader
- "You can..." not "You should..."
- Avoid hedging ("might", "could", "possibly")
- Use project-specific examples from real routes

## Risks & Trade-offs

**Risk:** Documentation drift from official Query docs

- **Mitigation:** Link to official docs for deep dives, focus on integration patterns

**Risk:** Too much duplication with official docs

- **Mitigation:** Reference official docs, only cover project-specific patterns

**Risk:** Documentation becomes stale

- **Mitigation:** validation script catches broken links; CI could run it

**Trade-off:** Depth vs brevity

- **Decision:** Brief with good examples, link to official docs for edge cases

## Migration Plan

N/A - new documentation, no migration needed

## Open Questions

- Should we create a separate `src/lib/query-options/` directory or colocate with routes?
  - **Answer:** Separate directory for reusability across routes
- Do we need Query devtools doc or just mention in overview?
  - **Answer:** Brief mention in overview with link to official docs
- Should we document @tanstack/react-query-devtools or assume known?
  - **Answer:** Assume known, mention location of devtools component in project
