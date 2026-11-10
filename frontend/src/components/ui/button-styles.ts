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
    'btn-dir--primary bg-terracotta text-inverse border border-terracotta hover:border-ink active:border-ink',
  accent:
    'btn-dir--accent bg-terracotta text-inverse border border-terracotta hover:border-terracotta-dark active:border-inverse/40',
  secondary:
    'btn-dir--secondary bg-paper text-ink border border-ink/30 hover:text-inverse hover:border-terracotta focus-visible:text-inverse focus-visible:border-terracotta',
  ink:
    'btn-dir--ink bg-ink text-inverse border border-ink hover:border-terracotta active:border-terracotta-dark',
  inverse:
    'btn-dir--inverse bg-transparent text-inverse border border-inverse/30 hover:border-terracotta hover:text-inverse focus-visible:border-terracotta',
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
  return [
    'btn-dir group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden isolate rounded-md font-medium tracking-[0.01em] text-center leading-snug',
    'disabled:bg-linen disabled:text-umber disabled:border-divider disabled:opacity-100 disabled:cursor-not-allowed cursor-pointer',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
