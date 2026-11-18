import React from 'react';
import { Tag } from 'lucide-react';

export interface TopSellingBadgeProps {
  rank?: number;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Top-Selling Badge with green background and fully rounded edges
 * Awarded to the top 3 products by sales volume & revenue generation.
 */
export function TopSellingBadge({
  rank,
  className = '',
  size = 'md',
}: TopSellingBadgeProps) {
  const isSm = size === 'sm';
  return (
    <span
      data-badge="top-selling"
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#1b4332] text-[#fceee3] font-semibold uppercase tracking-[0.14em] shadow-sm border border-emerald-400/30 ${
        isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"
      />
      <span>Top-Selling</span>
      <Tag className="w-3 h-3 text-emerald-300 shrink-0" />
    </span>
  );
}
