'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart-store';

export interface AddToCartButtonProps {
  productId: number;
  medusaVariantId?: string;
  inStock: boolean;
  quantity?: number;
  variation?: Array<{ attribute: string; value: string }>;
  label?: string;
  unavailableLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  openDrawerOnAdd?: boolean;
}

export function AddToCartButton({
  productId,
  medusaVariantId,
  inStock,
  quantity = 1,
  variation,
  label = 'Add to Bag',
  unavailableLabel = 'Out of stock',
  variant = 'primary',
  size = 'md',
  className = '',
  openDrawerOnAdd = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cart = useCartStore((state) => state.cart);
  const isHydrated = useCartStore((state) => state.isHydrated);

  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const addedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current !== null) {
        window.clearTimeout(addedTimerRef.current);
      }
    };
  }, []);

  const inCartQty = useMemo(() => {
    if (!isHydrated || !cart?.items?.length) return 0;
    const matched = cart.items.find(
      (item) =>
        (medusaVariantId && item.medusaVariantId === medusaVariantId) ||
        item.productId === productId
    );
    return matched?.quantity ?? 0;
  }, [isHydrated, cart, medusaVariantId, productId]);

  const handleClick = async () => {
    if (!inStock || submitting) return;
    setSubmitting(true);
    setLocalError(null);

    const result = await addItem({
      id: productId,
      medusaVariantId,
      quantity,
      variation,
      openBag: openDrawerOnAdd,
    });

    setSubmitting(false);

    if (result.ok) {
      if (addedTimerRef.current !== null) {
        window.clearTimeout(addedTimerRef.current);
      }
      setJustAdded(true);
      addedTimerRef.current = window.setTimeout(() => {
        setJustAdded(false);
        addedTimerRef.current = null;
      }, 1800);
    } else {
      setLocalError(result.error ?? 'Unable to add item.');
    }
  };

  const idleLabel =
    inCartQty > 0
      ? size === 'sm'
        ? `Add More (${inCartQty})`
        : `Add More (${inCartQty} in bag)`
      : label;

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={!inStock || submitting}
        onClick={handleClick}
        className={className}
      >
        {!inStock
          ? unavailableLabel
          : submitting
            ? 'Adding…'
            : justAdded
              ? 'Added to Bag ✓'
              : idleLabel}
      </Button>

      {localError ? (
        <p role="alert" className="text-xs text-crimson leading-snug">
          {localError}
        </p>
      ) : null}
    </div>
  );
}

