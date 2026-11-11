'use client';

import React, { useEffect, useState } from 'react';
import { useCouponStore } from '@/store/coupon-store';

export interface CouponCodeBoxProps {
  subtotal: number;
  shippingFee?: number;
  variant?: 'card' | 'drawer';
}

function formatExpiry(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CouponCodeBox({
  subtotal,
  shippingFee = 0,
  variant = 'card',
}: CouponCodeBoxProps) {
  const appliedCode = useCouponStore((s) => s.appliedCode);
  const validation = useCouponStore((s) => s.validation);
  const isApplying = useCouponStore((s) => s.isApplying);
  const error = useCouponStore((s) => s.error);
  const applyCoupon = useCouponStore((s) => s.applyCoupon);
  const syncWithTotals = useCouponStore((s) => s.syncWithTotals);
  const removeCoupon = useCouponStore((s) => s.removeCoupon);
  const clearError = useCouponStore((s) => s.clearError);

  const [codeInput, setCodeInput] = useState(appliedCode || '');
  const [drawerOpen, setDrawerOpen] = useState(Boolean(appliedCode));

  useEffect(() => {
    void syncWithTotals(subtotal, shippingFee);
  }, [subtotal, shippingFee, syncWithTotals]);

  const handleApply = async () => {
    await applyCoupon(codeInput, subtotal, shippingFee);
  };

  const handleRemove = () => {
    removeCoupon();
    setCodeInput('');
  };

  const isApplied = Boolean(appliedCode && validation?.valid);
  const expiryLabel = formatExpiry(validation?.coupon?.expiresAt);

  if (variant === 'drawer') {
    if (isApplied && validation) {
      return (
        <div className="rounded-xl border border-terracotta/45 bg-plaque-ink/10 px-3 py-2 text-xs text-plaque-ink">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 truncate">
              <span className="font-mono font-semibold text-terracotta">
                {validation.code}
              </span>{' '}
              <span className="text-plaque-ink/80">
                applied (-₹{validation.discountAmount.toLocaleString('en-IN')})
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 text-[11px] font-medium text-plaque-ink/75 hover:text-terracotta underline underline-offset-4 cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="font-medium text-terracotta hover:text-plaque-ink underline underline-offset-4 cursor-pointer"
          >
            {drawerOpen ? 'Hide coupon box' : 'Have a coupon code?'}
          </button>
        </div>
        {drawerOpen ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label htmlFor="drawer-coupon-input" className="sr-only">
                Coupon code
              </label>
              <input
                id="drawer-coupon-input"
                type="text"
                placeholder="COUPON CODE"
                value={codeInput}
                onChange={(e) => {
                  if (error) clearError();
                  setCodeInput(e.target.value.toUpperCase());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleApply();
                  }
                }}
                className="flex-1 min-w-0 min-h-[36px] rounded-full border border-plaque-ink/25 bg-plaque-ink/10 px-3.5 text-xs font-mono uppercase text-plaque-ink placeholder:text-plaque-ink/50 focus:outline-none focus:border-terracotta"
              />
              <button
                type="button"
                disabled={isApplying || !codeInput.trim()}
                onClick={() => void handleApply()}
                className="min-h-[36px] rounded-full bg-terracotta-solid px-4 text-xs font-medium text-on-accent hover:bg-terracotta-dark disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? '…' : 'Apply'}
              </button>
            </div>
            {error ? (
              <p role="alert" className="text-[11px] text-terracotta">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Promo &amp; Coupon Code
          </p>
        </div>
        {isApplied && validation?.coupon ? (
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-inverse">
            {validation.coupon.summaryLabel}
          </span>
        ) : null}
      </div>

      {isApplied && validation ? (
        <div
          role="status"
          className="rounded-xl border border-terracotta/40 bg-linen px-4 py-3 text-xs leading-relaxed"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">
                <span className="font-mono text-terracotta">
                  {validation.code}
                </span>{' '}
                applied — saving ₹
                {validation.discountAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-umber mt-0.5">
                {validation.coupon?.description ||
                  validation.coupon?.summaryLabel}
                {expiryLabel ? ` · Valid till ${expiryLabel}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 rounded-full border border-divider bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-crimson hover:text-crimson cursor-pointer transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-stretch gap-2">
            <label htmlFor="mbs-coupon-input" className="sr-only">
              Promo or coupon code
            </label>
            <input
              id="mbs-coupon-input"
              type="text"
              placeholder="Enter coupon code (e.g. SANA15)"
              value={codeInput}
              onChange={(e) => {
                if (error) clearError();
                setCodeInput(e.target.value.toUpperCase());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleApply();
                }
              }}
              className="flex-1 min-w-0 min-h-[42px] rounded-full border border-divider bg-canvas px-4 text-sm font-mono uppercase text-ink placeholder:font-sans placeholder:normal-case placeholder:text-umber/70 focus:outline-none focus:border-ink"
            />
            <button
              type="button"
              disabled={isApplying || !codeInput.trim()}
              onClick={() => void handleApply()}
              className="inline-flex items-center justify-center min-h-[42px] rounded-md bg-ink px-5 text-xs sm:text-sm font-medium text-inverse hover:bg-terracotta-solid hover:text-on-accent disabled:bg-linen disabled:text-umber disabled:border disabled:border-divider cursor-pointer transition-colors"
            >
              {isApplying ? 'Applying…' : 'Apply'}
            </button>
          </div>

          {error ? (
            <p role="alert" className="text-xs text-crimson">
              {error}
            </p>
          ) : (
            <p className="text-[11px] text-umber">
              Percentage and flat ₹ promo codes verified instantly at checkout.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
