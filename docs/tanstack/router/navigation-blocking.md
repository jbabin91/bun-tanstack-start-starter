# Navigation Blocking

Navigation blocking prevents navigation from occurring. This is essential when users have:

- Unsaved changes
- In-progress forms
- Active payments or transactions

When navigation is blocked, you can show a prompt or custom UI to confirm the user wants to navigate away.

- If the user confirms, navigation proceeds normally
- If the user cancels, all pending navigations are blocked

## How Navigation Blocking Works

Navigation blocking adds one or more layers of "blockers" to the history API. If any blockers are present, navigation is paused via:

- **Custom UI**: For router-controlled navigation, execute blocker functions asynchronously and sequentially. If any returns `true`, navigation proceeds. If any returns `false`, navigation is canceled.
- **`onbeforeunload` event**: For page events like tab closing or refresh, the browser's dialog is shown. If confirmed, all blockers are bypassed. If canceled, unload is prevented.

## Using Navigation Blocking

Use either hook-based or component-based blocking:

### Hook-Based Blocking

Use the `useBlocker` hook to prevent navigation if a form is dirty:

```tsx
import { useBlocker } from '@tanstack/react-router';

function MyComponent() {
  const [formIsDirty, setFormIsDirty] = useState(false);

  useBlocker({
    shouldBlockFn: () => {
      if (!formIsDirty) return false;

      const shouldLeave = confirm('Are you sure you want to leave?');
      return !shouldLeave;
    },
  });

  // ...
}
```

Access current and next locations with `withResolver: true`:

```tsx
const { proceed, reset, status } = useBlocker({
  shouldBlockFn: ({ current, next }) => {
    return (
      current.routeId === '/foo' &&
      next.fullPath === '/bar/$id' &&
      next.params.id === 123 &&
      next.search.hello === 'world'
    );
  },
  withResolver: true,
});
```

Control the `beforeunload` handler:

```tsx
useBlocker({
  shouldBlockFn: () => formIsDirty,
  enableBeforeUnload: formIsDirty, // or () => formIsDirty
});
```

### Component-Based Blocking

Use the `Block` component:

```tsx
import { Block } from '@tanstack/react-router';

function MyComponent() {
  const [formIsDirty, setFormIsDirty] = useState(false);

  return (
    <Block
      shouldBlockFn={() => {
        if (!formIsDirty) return false;

        const shouldLeave = confirm('Are you sure you want to leave?');
        return !shouldLeave;
      }}
      enableBeforeUnload={formIsDirty}
    />
  );
}
```

Or with render props:

```tsx
<Block
  shouldBlockFn={() => formIsDirty}
  enableBeforeUnload={formIsDirty}
  withResolver
>
  {({ status, proceed, reset }) => (
    <>
      {status === 'blocked' && (
        <div>
          <p>Are you sure you want to leave?</p>
          <button onClick={proceed}>Yes</button>
          <button onClick={reset}>No</button>
        </div>
      )}
    </>
  )}
</Block>
);
```

## Custom UI

### Hook-Based with Resolver

Use `withResolver: true` to show custom UI and control when navigation proceeds:

```tsx
const { proceed, reset, status } = useBlocker({
  shouldBlockFn: () => formIsDirty,
  withResolver: true,
});

return (
  <>
    {status === 'blocked' && (
      <div>
        <p>Are you sure you want to leave?</p>
        <button onClick={proceed}>Yes</button>
        <button onClick={reset}>No</button>
      </div>
    )}
  </>
);
```

### Hook-Based Without Resolver

Return a Promise to handle async confirmations with custom UI:

```tsx
useBlocker({
  shouldBlockFn: () => {
    if (!formIsDirty) return false;

    return new Promise<boolean>((resolve) => {
      modals.open({
        title: 'Are you sure?',
        children: (
          <SaveBlocker
            confirm={() => {
              modals.closeAll();
              resolve(false);
            }}
            reject={() => {
              modals.closeAll();
              resolve(true);
            }}
          />
        ),
        onClose: () => resolve(true),
      });
    });
  },
});
```

### Component-Based Custom UI

The `Block` component also supports custom UI via render props (same as hook example above).
