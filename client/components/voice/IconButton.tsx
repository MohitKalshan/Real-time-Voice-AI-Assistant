import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name: icon-only buttons must have one. */
  label: string;
  active?: boolean;
  children: ReactNode;
}

/** 44px ghost icon button (design: `icon-button` / `icon-button-active`). */
export function IconButton({ label, active = false, children, className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`press flex size-11 items-center justify-center rounded-xl ${
        active ? 'bg-sunken text-ink' : 'text-ink-2 hover:bg-sunken/60 hover:text-ink'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
