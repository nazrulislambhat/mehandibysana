import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta text-inverse border border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark active:bg-ink active:border-ink',
  accent:
    'bg-terracotta text-inverse border border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark active:bg-ink active:border-ink',
  secondary:
    'bg-paper text-ink border border-ink/30 hover:bg-terracotta hover:text-inverse hover:border-terracotta',
  ghost:
    'bg-transparent text-terracotta border border-transparent hover:bg-linen hover:text-terracotta-dark',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-sm',
  md: 'min-h-[44px] px-6 py-2.5 text-sm',
  lg: 'min-h-[48px] px-7 py-3 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: StyleOptions = {}): string {
  return [
    'inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-[0.01em] text-center leading-snug',
    'disabled:bg-linen disabled:text-umber disabled:border-divider disabled:opacity-100 disabled:cursor-not-allowed cursor-pointer',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  prefetch?: boolean;
  onClick?: () => void;
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ariaLabel,
  prefetch,
  onClick,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      prefetch={prefetch}
      onClick={onClick}
      className={buttonClasses({ variant, size, className })}
    >
      {children}
    </Link>
  );
}

