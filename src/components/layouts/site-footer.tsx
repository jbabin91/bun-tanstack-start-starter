import { Link } from '@tanstack/react-router';

export function SiteFooter() {
  return (
    <footer className="bg-background border-border/60 border-t">
      <div className="container px-4 py-6 sm:px-6">
        <p className="font-heading text-foreground text-lg">
          <Link
            aria-label="Home"
            className="hover:text-primary"
            preload="intent"
            to="/"
          >
            TanStack Start{' '}
            <span className="text-muted-foreground">starter</span>
          </Link>
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Built by the TanStack community to demonstrate router, query, and
          start integrations.
        </p>
      </div>
    </footer>
  );
}
