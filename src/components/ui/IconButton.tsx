import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

export type IconButtonSize = keyof typeof SIZE_CLASSES;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  label,
  size = 'md',
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-full text-abyss transition-colors duration-[var(--motion-fast)] hover:bg-shell disabled:cursor-not-allowed disabled:text-ink-soft/40',
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
