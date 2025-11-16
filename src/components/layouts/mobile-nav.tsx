import { Link } from '@tanstack/react-router';
import * as React from 'react';

import { Icon } from '@/components/icons';
import type { NavItem } from '@/components/layouts/main-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type MobileNavProps = {
  items: readonly NavItem[];
  className?: string;
};

function MobileNav({ items, className }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            className={cn('relative size-8', className)}
            size="icon"
            variant="ghost"
          >
            <Icon.Menu className="size-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        }
      />
      <SheetContent className="w-72 gap-8" side="left">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Menu</p>
            <div className="mt-2 flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  className="text-foreground hover:bg-muted rounded-md px-2 py-1.5 text-base font-medium"
                  preload="intent"
                  to={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { MobileNav };
