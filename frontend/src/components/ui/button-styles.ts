export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ink'
  | 'inverse'
  | 'ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'btn-dir--primary bg-terracotta-solid text-on-accent border border-terracotta-solid hover:text-plaque-ink hover:border-plaque-border active:border-plaque-border',
  accent:
    'btn-dir--accent bg-terracotta-solid text-on-accent border border-terracotta-solid hover:border-terracotta-dark active:border-on-accent/40',
  secondary:
    'btn-dir--secondary bg-paper text-ink border border-ink/30 hover:text-on-accent hover:border-terracotta-solid focus-visible:text-on-accent focus-visible:border-terracotta-solid',
  ink:
    'btn-dir--ink bg-ink text-inverse border border-ink hover:text-on-accent hover:border-terracotta-solid focus-visible:text-on-accent active:border-terracotta-dark',
  inverse:
    'btn-dir--inverse bg-transparent text-plaque-ink border border-plaque-ink/30 hover:border-terracotta-solid hover:text-on-accent focus-visible:border-terracotta-solid focus-visible:text-on-accent',
  ghost:
    'btn-dir--ghost bg-transparent text-terracotta border border-transparent hover:text-terracotta-dark',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'min-h-[34px] px-3.5 py-1.5 text-xs',
  sm: 'min-h-[40px] px-4 py-2 text-sm',
  md: 'min-h-[44px] px-6 py-2.5 text-sm',
  lg: 'min-h-[48px] px-7 py-3 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonStyleOptions = {}): string {
  const hasRadiusOverride = className
    .split(/\s+/)
    .some((token) => /^(?:[a-z0-9-]+:)*rounded(?:$|-)/.test(token));

  return [
    'btn-dir group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden isolate font-medium tracking-[0.01em] text-center leading-snug',
    hasRadiusOverride ? '' : 'rounded-md',
    'disabled:bg-linen disabled:text-umber disabled:border-divider disabled:opacity-100 disabled:cursor-not-allowed cursor-pointer',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
