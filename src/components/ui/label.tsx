import * as React from 'react';

import { cn } from '@/lib/utils';

type LabelProps = React.ComponentPropsWithRef<'label'>;

function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      className={cn('inline-flex items-center gap-2 text-sm/4', className)}
      data-slot="label"
      htmlFor={htmlFor}
      {...props}
    />
  );
}

export { Label };
