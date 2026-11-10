'use client';

import React, { useState } from 'react';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart-store';

export interface AddToCartButtonProps {
  productId: number;
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
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!inStock || submitting) return;
    setSubmitting(true);
    setLocalError(null);

    const result = await addItem({
      id: productId,
      quantity,
      variation,
      openBag: openDrawerOnAdd,
    });

    setSubmitting(false);

    if (result.ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } else {
      setLocalError(result.error ?? 'Unable to add item.');
    }
  };

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
              ? 'Added to Bag'
              : label}
      </Button>

      {localError ? (
        <p role="alert" className="text-xs text-crimson leading-snug">
          {localError}
        </p>
      ) : null}
    </div>
  );
}

