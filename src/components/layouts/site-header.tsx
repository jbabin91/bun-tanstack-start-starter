import { Link } from '@tanstack/react-router';

import { MainNav, type NavItem } from '@/components/layouts/main-nav';
import { MobileNav } from '@/components/layouts/mobile-nav';
import { ModeSwitcher } from '@/components/mode-switcher';

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/demo/start/server-funcs', label: 'Start Server Functions' },
  { href: '/demo/start/api-request', label: 'API Request' },
  { href: '/demo/start/ssr', label: 'SSR Demos' },
  { href: '/demo/tanstack-query', label: 'TanStack Query' },
];

type SiteHeaderProps = {
  navItems?: readonly NavItem[];
  brandHref?: string;
  brandLabel?: string;
  mobileNav?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

function SiteHeader({
  navItems = NAV_ITEMS,
  brandHref = '/',
  brandLabel = 'TanStack Start',
  mobileNav,
  children,
  actions,
}: SiteHeaderProps) {
  const navSlot = children ?? (
    <MainNav className="hidden lg:flex" items={navItems} />
  );
  const mobileSlot = mobileNav ?? (
    <MobileNav className="flex lg:hidden" items={navItems} />
  );
  const actionSlot = actions ?? <ModeSwitcher />;

  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <div className="container flex h-14 items-center gap-3 px-4 sm:px-6">
        {mobileSlot}
        <Link
          aria-label="Home"
          className="font-heading text-foreground flex items-center gap-2 text-lg font-semibold"
          preload="intent"
          to={brandHref}
        >
          <img
            alt="TanStack logo"
            className="size-7"
            src="/tanstack-circle-logo.png"
          />
          <span className="hidden sm:inline-flex">{brandLabel}</span>
        </Link>
        <div className="hidden flex-1 lg:flex">{navSlot}</div>
        <div className="ms-auto flex items-center gap-2">{actionSlot}</div>
      </div>
    </header>
  );
}

export { SiteHeader };
