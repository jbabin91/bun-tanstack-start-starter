'use client';

import { Link, type NotFoundRouteProps } from '@tanstack/react-router';
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

type NotFoundProps = NotFoundRouteProps & {
  children?: React.ReactNode;
};

function NotFound({ children, data }: NotFoundProps) {
  const handleBack = React.useCallback(() => {
    const win = globalThis.window;
    if (!win) return;
    if (win.history.length > 1) {
      win.history.back();
      return;
    }

    win.location.assign('/');
  }, []);

  return (
    <Empty className="border border-dashed">
      <EmptyMedia variant="icon">
        <Icon.Home className="text-muted-foreground" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>The page could not be found</EmptyTitle>
        <EmptyDescription>
          {children ??
            (typeof data === 'string' && data.length > 0
              ? data
              : 'The page you are looking for may have been moved, deleted, or might never have existed.')}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={handleBack}>
            <Icon.ArrowLeft className="size-4" />
            Go back
          </Button>
          <Button
            render={(buttonProps) => (
              <Link {...buttonProps} to="/">
                <Icon.Home className="size-4" />
                Start over
              </Link>
            )}
            size="sm"
          />
        </div>
      </EmptyContent>
    </Empty>
  );
}

export { NotFound };
