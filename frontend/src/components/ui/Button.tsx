'use client';

import React from 'react';
import Link from 'next/link';
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from '@/components/ui/button-styles';
import { createDirectionalPointerHandlers } from '@/lib/directional-hover';

export type { ButtonVariant, ButtonSize } from '@/components/ui/button-styles';
export { buttonClasses } from '@/components/ui/button-styles';

function DirectionalLayers() {
  return (
    <span aria-hidden="true" className="btn-dir-layers">
      <span className="btn-dir-lead" />
      <span className="btn-dir-fill" />
    </span>
  );
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
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: ButtonProps) {
  const dirHandlers = createDirectionalPointerHandlers<HTMLButtonElement>();

  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      onPointerEnter={(e) => {
        if (!props.disabled) dirHandlers.onPointerEnter(e);
        onPointerEnter?.(e);
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={(e) => {
        dirHandlers.onPointerLeave(e);
        onPointerLeave?.(e);
      }}
      {...props}
    >
      <DirectionalLayers />
      <span className="btn-dir-content">{children}</span>
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
  ariaCurrent?: React.AriaAttributes['aria-current'];
  prefetch?: boolean;
  scroll?: boolean;
  onClick?: () => void;
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ariaLabel,
  ariaCurrent,
  prefetch,
  scroll,
  onClick,
}: LinkButtonProps) {
  const dirHandlers = createDirectionalPointerHandlers<HTMLAnchorElement>();

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      prefetch={prefetch}
      scroll={scroll}
      onClick={onClick}
      onPointerEnter={dirHandlers.onPointerEnter}
      onPointerLeave={dirHandlers.onPointerLeave}
      className={buttonClasses({ variant, size, className })}
    >
      <DirectionalLayers />
      <span className="btn-dir-content">{children}</span>
    </Link>
  );
}
