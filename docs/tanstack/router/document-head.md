# Document Head Management

Document head management is the process of managing the head, title, meta, link, and script tags of a document. TanStack Router provides a robust way to manage the document head for full-stack applications using Start and for single-page applications.

It provides:

- Automatic deduping of `title` and `meta` tags
- Automatic loading/unloading of tags based on route visibility
- A composable way to merge `title` and `meta` tags from nested routes

Managing the document head is crucial for:

- SEO
- Social media sharing
- Analytics
- CSS and JS loading/unloading

## Managing the Document Head

To manage the document head, render both the `<HeadContent />` and `<Scripts />` components and use the `routeOptions.head` property to return an object with `title`, `meta`, `links`, `styles`, and `scripts` properties.

```tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'My App is a web application',
      },
      {
        title: 'My App',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
    styles: [
      {
        media: 'all and (max-width: 500px)',
        children: `p {
          color: blue;
          background-color: yellow;
        }`,
      },
    ],
    scripts: [
      {
        src: 'https://www.google-analytics.com/analytics.js',
      },
    ],
  }),
});
```

### Deduping

By default, TanStack Router dedupes `title` and `meta` tags, preferring the **last** occurrence in nested routes.

- `title` tags in child routes override parent routes (you can compose them together)
- `meta` tags with the same `name` or `property` are overridden by the last occurrence in nested routes

### `<HeadContent />`

The `<HeadContent />` component is **required** to render head, title, meta, link, and head-related script tags. Render it as high up in the component tree as possible, ideally in the `<head>` tag.

### Start/Full-Stack Applications

```tsx
import { HeadContent } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  ),
});
```

### Single-Page Applications

First, remove the `<title>` tag from index.html if set.

```tsx
import { HeadContent } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
});
```

## Managing Body Scripts

In addition to scripts in the `<head>` tag, you can render scripts in the `<body>` tag using `routeOptions.scripts`. This is useful for loading scripts that require the DOM before your app's entry point (including hydration in Start).

To do this:

- Use the `scripts` property of `routeOptions`
- Render the `<Scripts />` component

```tsx
export const Route = createRootRoute({
  scripts: () => [
    {
      children: 'console.log("Hello, world!")',
    },
  ],
});
```

### `<Scripts />`

The `<Scripts />` component is **required** to render body scripts. Render it in the `<body>` tag or as high up in the component tree as possible.

```tsx
import { createRootRoute, Scripts } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <html>
      <head />
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
```
