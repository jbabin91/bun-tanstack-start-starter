import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const iconVariants = cva('', {
  variants: {
    size: {
      '2xl': 'size-8',
      '2xs': 'size-2',
      '3xl': 'size-10',
      '4xl': 'size-12',
      lg: 'size-5',
      md: 'size-4',
      sm: 'size-3',
      xl: 'size-6',
      xs: 'size-2.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type IconProps = VariantProps<typeof iconVariants> & ComponentProps<'svg'>;

function createIcon(IconComponent: LucideIcon) {
  function IconWrapper({ size, className, ...props }: IconProps) {
    return (
      <IconComponent
        className={cn(iconVariants({ size }), className)}
        {...props}
      />
    );
  }
  IconWrapper.displayName = `Icon(${IconComponent.displayName ?? IconComponent.name})`;
  return IconWrapper;
}

// Central icon registry so we can swap icon libraries in one place if needed.
const Icon = {
  AlertTriangle: createIcon(LucideIcons.AlertTriangleIcon),
  ArrowLeft: createIcon(LucideIcons.ArrowLeftIcon),
  Check: createIcon(LucideIcons.CheckIcon),
  ChevronDown: createIcon(LucideIcons.ChevronDownIcon),
  ChevronLeft: createIcon(LucideIcons.ChevronLeftIcon),
  ChevronRight: createIcon(LucideIcons.ChevronRightIcon),
  ChevronsUpDown: createIcon(LucideIcons.ChevronsUpDownIcon),
  ChevronUp: createIcon(LucideIcons.ChevronUpIcon),
  CircleAlert: createIcon(LucideIcons.CircleAlertIcon),
  CircleCheck: createIcon(LucideIcons.CircleCheckIcon),
  Home: createIcon(LucideIcons.HomeIcon),
  Info: createIcon(LucideIcons.InfoIcon),
  Loader2: createIcon(LucideIcons.Loader2Icon),
  LoaderCircle: createIcon(LucideIcons.LoaderCircleIcon),
  Menu: createIcon(LucideIcons.MenuIcon),
  Minus: createIcon(LucideIcons.MinusIcon),
  Moon: createIcon(LucideIcons.MoonIcon),
  MoreHorizontal: createIcon(LucideIcons.MoreHorizontalIcon),
  Network: createIcon(LucideIcons.NetworkIcon),
  Plus: createIcon(LucideIcons.PlusIcon),
  RotateCcw: createIcon(LucideIcons.RotateCcwIcon),
  Route: createIcon(LucideIcons.RouteIcon),
  Server: createIcon(LucideIcons.ServerIcon),
  Shield: createIcon(LucideIcons.ShieldIcon),
  Sparkles: createIcon(LucideIcons.SparklesIcon),
  SquareFunction: createIcon(LucideIcons.SquareFunctionIcon),
  StickyNote: createIcon(LucideIcons.StickyNoteIcon),
  Sun: createIcon(LucideIcons.SunIcon),
  TriangleAlert: createIcon(LucideIcons.TriangleAlertIcon),
  Waves: createIcon(LucideIcons.WavesIcon),
  X: createIcon(LucideIcons.XIcon),
  Zap: createIcon(LucideIcons.ZapIcon),
} satisfies Record<string, ReturnType<typeof createIcon>>;

type IconName = keyof typeof Icon;

export { Icon, type IconName, type IconProps };
