'use client';

import {
  ErrorComponent as RouterErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';
import * as React from 'react';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    select: (state) => state.id === rootRouteId,
    strict: false,
  });

  const handleRetry = React.useCallback(() => {
    router.invalidate();
  }, [router]);

  const handleBack = React.useCallback(() => {
    const win = globalThis.window;
    if (!win) return;
    if (win.history.length > 1) {
      win.history.back();
      return;
    }

    router.navigate({ to: '/' });
  }, [router]);

  return (
    <Empty className="border-destructive/30 border">
      <EmptyMedia variant="icon">
        <Icon.AlertTriangle className="text-destructive" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          We couldn&apos;t load this page. Try again or go back to where you
          started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="text-muted-foreground w-full max-w-md text-left text-sm">
          <RouterErrorComponent error={error} />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={handleRetry}>
            <Icon.RotateCcw className="size-4" />
            Try again
          </Button>
          {!isRoot && (
            <Button size="sm" variant="ghost" onClick={handleBack}>
              <Icon.ArrowLeft className="size-4" />
              Go back
            </Button>
          )}
          <Button
            render={(buttonProps) => (
              <Link {...buttonProps} to="/">
                <Icon.Home className="size-4" />
                Go home
              </Link>
            )}
            size="sm"
          />
        </div>
      </EmptyContent>
    </Empty>
  );
}

export { DefaultCatchBoundary };
