'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      className="relative size-8"
      size="icon"
      title="Toggle theme"
      variant="ghost"
      onClick={toggleTheme}
    >
      <Icon.Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Icon.Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
