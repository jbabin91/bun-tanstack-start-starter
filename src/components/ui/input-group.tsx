'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { Input, type InputProps } from '@/components/ui/input';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border-input bg-background ring-ring/24 has-[input:focus-visible,textarea:focus-visible]:border-ring has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive/36 has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive/64 has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:ring-destructive/16 dark:bg-input/32 dark:has-[input[aria-invalid],textarea[aria-invalid]]:ring-destructive/24 relative inline-flex w-full min-w-0 items-center rounded-lg border bg-clip-padding text-base/5 shadow-xs transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-[input:disabled,textarea:disabled]:not-has-[input:focus-visible,textarea:focus-visible]:not-has-[input[aria-invalid],textarea[aria-invalid]]:before:shadow-[0_1px_--theme(--color-black/4%)] has-data-[align=block-end]:h-auto has-data-[align=block-end]:flex-col has-data-[align=block-start]:h-auto has-data-[align=block-start]:flex-col has-[input:disabled,textarea:disabled]:opacity-64 has-[input:disabled,textarea:disabled,input:focus-visible,textarea:focus-visible,input[aria-invalid],textarea[aria-invalid]]:shadow-none has-[input:focus-visible,textarea:focus-visible]:ring-[3px] has-[textarea]:h-auto sm:text-sm dark:not-in-data-[slot=group]:bg-clip-border dark:not-has-[input:disabled,textarea:disabled]:not-has-[input:focus-visible,textarea:focus-visible]:not-has-[input[aria-invalid],textarea[aria-invalid]]:before:shadow-[0_-1px_--theme(--color-white/8%)] has-data-[align=inline-end]:**:[[data-size=sm]_input]:pe-1.5 has-data-[align=inline-start]:**:[[data-size=sm]_input]:ps-1.5 *:[[data-slot=input-control],[data-slot=textarea-control]]:contents *:[[data-slot=input-control],[data-slot=textarea-control]]:before:hidden has-data-[align=block-end]:**:[input]:pt-3 has-data-[align=block-start]:**:[input]:pb-[calc(--spacing(3)-1px)] has-data-[align=inline-end]:**:[input]:pe-2 has-data-[align=inline-start]:**:[input]:ps-2 **:[textarea_button]:rounded-[calc(var(--radius-md)-1px)] **:[textarea]:min-h-20.5 **:[textarea]:resize-none **:[textarea]:py-[calc(--spacing(3)-1px)] **:[textarea]:max-sm:min-h-23.5',
        className,
      )}
      data-slot="input-group"
      role="group"
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 select-none not-has-[button]:**:[svg]:opacity-72 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'block-end':
          'order-last w-full justify-start px-[calc(--spacing(3)-1px)] pb-[calc(--spacing(3)-1px)] [.border-t]:pt-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]',
        'block-start':
          'order-first w-full justify-start px-[calc(--spacing(3)-1px)] pt-[calc(--spacing(3)-1px)] [.border-b]:pb-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]',
        'inline-end':
          'order-last pe-[calc(--spacing(3)-1px)] has-[>[data-slot=badge]]:-me-1.5 has-[>button]:-me-2 has-[>kbd]:me-[-0.35rem] [[data-size=sm]+&]:pe-[calc(--spacing(2.5)-1px)]',
        'inline-start':
          'order-first ps-[calc(--spacing(3)-1px)] has-[>[data-slot=badge]]:-ms-1.5 has-[>button]:-ms-2 has-[>kbd]:ms-[-0.35rem] [[data-size=sm]+&]:ps-[calc(--spacing(2.5)-1px)]',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

const INTERACTIVE_CHILD_SELECTOR =
  'button, a, input, textarea, select, summary, [role=button], [role=link]';

function focusNearestControl(container: HTMLElement) {
  const group =
    container.closest<HTMLElement>('[data-slot="input-group"]') ??
    container.parentElement;
  const control = group?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    'input, textarea',
  );
  const hasFocusedControl = Boolean(
    group?.querySelector('input:focus, textarea:focus'),
  );
  if (control && !hasFocusedControl) {
    control.focus();
  }
}

function isEventFromNestedInteractive(
  target: EventTarget | null,
  currentTarget: HTMLElement,
) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const interactiveAncestor = target.closest<HTMLElement>(
    INTERACTIVE_CHILD_SELECTOR,
  );
  return Boolean(
    interactiveAncestor &&
      interactiveAncestor !== currentTarget &&
      currentTarget.contains(interactiveAncestor),
  );
}

function InputGroupAddon({
  className,
  align = 'inline-start',
  onMouseDown,
  onKeyDown,
  role: roleProp = 'button',
  tabIndex: tabIndexProp = 0,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event);
    if (event.defaultPrevented) return;
    if (isEventFromNestedInteractive(event.target, event.currentTarget)) return;
    event.preventDefault();
    focusNearestControl(event.currentTarget);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (isEventFromNestedInteractive(event.target, event.currentTarget)) return;
    event.preventDefault();
    focusNearestControl(event.currentTarget);
  };

  return (
    <div
      className={cn(inputGroupAddonVariants({ align }), className)}
      data-align={align}
      data-slot="input-group-addon"
      role={roleProp}
      tabIndex={tabIndexProp}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: InputProps) {
  return <Input unstyled className={className} {...props} />;
}

function InputGroupTextarea({ className, ...props }: TextareaProps) {
  return <Textarea unstyled className={className} {...props} />;
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
