import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={clsx('animate-pulse rounded-md bg-line', className)}
      {...props}
    />
  );
}
