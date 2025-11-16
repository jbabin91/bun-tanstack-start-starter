import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
};

type MainNavProps = {
  items: readonly NavItem[];
  className?: string;
};

function MainNav({ items, className }: MainNavProps) {
  return (
    <nav className={cn('items-center gap-2', className)}>
      {items.map((item) => (
        <Button
          key={item.href}
          className="text-sm"
          render={
            <Link
              activeProps={{ className: 'text-primary', 'data-pressed': true }}
              preload="intent"
              to={item.href}
            />
          }
          size="sm"
          variant="ghost"
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export { MainNav, type NavItem };
