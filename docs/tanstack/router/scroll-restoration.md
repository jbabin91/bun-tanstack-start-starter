# Scroll Restoration

## Hash and Top-of-Page Scrolling

TanStack Router supports hash scrolling and top-of-page scrolling out of the box without configuration.

## Scroll-to-Top and Nested Scrollable Areas

By default, only the `window` is scrolled to the top after navigation. For apps with custom scrollable areas (nested divs), you can add selectors via `routerOptions.scrollToTopSelectors`:

```tsx
const router = createRouter({
  scrollToTopSelectors: ['#main-scrollable-area'],
});
```

For complex selectors (Shadow DOM, etc.), pass functions:

```tsx
const selector = () =>
  document
    .querySelector('#shadowRootParent')
    ?.shadowRoot?.querySelector('#main-scrollable-area');

const router = createRouter({
  scrollToTopSelectors: [selector],
});
```

These selectors are handled **in addition to `window`**.

## Scroll Restoration

Scroll restoration is difficult in SPAs because:

- SPAs use `history.pushState`, so the browser doesn't know to restore scroll natively
- Content renders asynchronously, so page height isn't known until after render
- Multiple scrollable containers make restoring complex

TanStack Router automatically handles this by:

- Monitoring scroll events
- Caching scroll positions per route
- Restoring positions after navigation before DOM paint

Enable with one option:

```tsx
import { createRouter } from '@tanstack/react-router';

const router = createRouter({
  scrollRestoration: true,
});
```

> [!NOTE]
> The deprecated `<ScrollRestoration />` component still works but should be replaced with the `scrollRestoration` option.

## Custom Cache Keys

Customize the cache key for scroll positions using `getScrollRestorationKey`:

```tsx
import { createRouter } from '@tanstack/react-router';

const router = createRouter({
  getScrollRestorationKey: (location) => location.pathname,
});
```

Conditionally sync some paths:

```tsx
const router = createRouter({
  getScrollRestorationKey: (location) => {
    const paths = ['/', '/chat'];
    return paths.includes(location.pathname)
      ? location.pathname
      : location.state.__TSR_key!;
  },
});
```

> Note: Older versions used `location.state.key`, now it's `state.__TSR_key`.

## Preventing Scroll Restoration

Disable scroll restoration per navigation:

```tsx
<Link resetScroll={false}>Link</Link>;

navigate({ resetScroll: false });

redirect({ resetScroll: false });
```

When `resetScroll={false}`, scroll position is restored for back navigation but NOT reset for new navigations.

## Manual Scroll Restoration

For virtualized lists and complex UIs, manually control scroll:

```tsx
function Component() {
  const scrollEntry = useElementScrollRestoration({
    getElement: () => window,
  });

  const virtualizer = useWindowVirtualizer({
    count: 10000,
    estimateSize: () => 100,
    initialOffset: scrollEntry?.scrollY,
  });

  return (
    <div>
      {virtualizer.getVirtualItems().map((item) => (
        // ...
      ))}
    </div>
  );
}
```

For specific elements, use the `data-scroll-restoration-id` attribute:

```tsx
function Component() {
  const scrollRestorationId = 'myVirtualizedContent';

  const scrollEntry = useElementScrollRestoration({
    id: scrollRestorationId,
  });

  const virtualizerParentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => virtualizerParentRef.current,
    estimateSize: () => 100,
    initialOffset: scrollEntry?.scrollY,
  });

  return (
    <div
      ref={virtualizerParentRef}
      data-scroll-restoration-id={scrollRestorationId}
      className="overflow-auto"
    >
      {/* virtualized items */}
    </div>
  );
}
```

## Scroll Behavior

Control scroll behavior (smooth vs instant) during navigation:

```tsx
const router = createRouter({
  scrollRestorationBehavior: 'instant',
});
```

Options: `smooth`, `instant`, `auto` (see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView#behavior))
