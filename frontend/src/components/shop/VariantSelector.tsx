'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type {
  StorefrontImage,
  StorefrontProduct,
  StorefrontVariation,
} from '@/types/storefront';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductGallery as ProductGalleryLazy } from '@/components/shop/ProductGallery';
import { PincodeChecker } from '@/components/shop/PincodeChecker';
import { HennaConeIcon } from '@/components/graphics/BrandIcons';

export interface VariantSelectorProps {
  product: StorefrontProduct;
  onVariationChange?: (variation: StorefrontVariation | null) => void;
}

function formatPrice(amount: number, symbol: string): string {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${symbol}${formatted}`;
}

export function VariantSelector({
  product,
  onVariationChange,
}: VariantSelectorProps) {
  const attributeGroups = useMemo(() => {
    if (product.attributes.length > 0) {
      return product.attributes;
    }

    const derived = new Map<string, Set<string>>();
    for (const variation of product.variations) {
      for (const attr of variation.attributes) {
        if (!derived.has(attr.attribute)) {
          derived.set(attr.attribute, new Set<string>());
        }
        derived.get(attr.attribute)?.add(attr.value);
      }
    }

    return Array.from(derived.entries()).map(([name, values]) => ({
      name,
      options: Array.from(values),
    }));
  }, [product.attributes, product.variations]);

  const initialSelection = useMemo(() => {
    const firstValidVariation =
      product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null;

    const map: Record<string, string> = {};
    for (const group of attributeGroups) {
      const matched = firstValidVariation?.attributes.find(
        (a) => a.attribute.toLowerCase() === group.name.toLowerCase()
      );
      map[group.name] = matched?.value ?? group.options[0] ?? '';
    }
    return map;
  }, [attributeGroups, product.variations]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>(initialSelection);
  const [quantity, setQuantity] = useState(1);

  const isVariable =
    product.type === 'variable' || product.variations.length > 0;

  const activeVariation = useMemo<StorefrontVariation | null>(() => {
    if (!isVariable || product.variations.length === 0) return null;

    return (
      product.variations.find((variation) =>
        attributeGroups.every((group) => {
          const picked = selectedOptions[group.name];
          if (!picked) return false;
          const attrMatch = variation.attributes.find(
            (a) => a.attribute.toLowerCase() === group.name.toLowerCase()
          );
          if (!attrMatch) return true;
          return attrMatch.value.toLowerCase() === picked.toLowerCase();
        })
      ) ?? null
    );
  }, [isVariable, product.variations, attributeGroups, selectedOptions]);

  const handleOptionSelect = (attrName: string, value: string) => {
    const next = { ...selectedOptions, [attrName]: value };
    setSelectedOptions(next);

    if (onVariationChange) {
      const matched =
        product.variations.find((variation) =>
          attributeGroups.every((group) => {
            const picked = next[group.name];
            if (!picked) return false;
            const attrMatch = variation.attributes.find(
              (a) => a.attribute.toLowerCase() === group.name.toLowerCase()
            );
            if (!attrMatch) return true;
            return attrMatch.value.toLowerCase() === picked.toLowerCase();
          })
        ) ?? null;
      onVariationChange(matched);
    }
  };

  const optionHasVariation = (attrName: string, optionValue: string): boolean => {
    if (!isVariable || product.variations.length === 0) return true;
    return product.variations.some((variation) => {
      const attrMatch = variation.attributes.find(
        (a) => a.attribute.toLowerCase() === attrName.toLowerCase()
      );
      return attrMatch
        ? attrMatch.value.toLowerCase() === optionValue.toLowerCase()
        : true;
    });
  };

  const optionHasStock = (attrName: string, optionValue: string): boolean => {
    if (!isVariable || product.variations.length === 0) return product.inStock;
    return product.variations.some((variation) => {
      if (!variation.inStock) return false;
      const attrMatch = variation.attributes.find(
        (a) => a.attribute.toLowerCase() === attrName.toLowerCase()
      );
      return attrMatch
        ? attrMatch.value.toLowerCase() === optionValue.toLowerCase()
        : true;
    });
  };

  const displayPrice = activeVariation ? activeVariation.price : product.price;
  const displayRegular = activeVariation
    ? activeVariation.regularPrice
    : product.regularPrice;
  const hasMissingVariation =
    isVariable && product.variations.length > 0 && activeVariation === null;
  const activeInStock = hasMissingVariation
    ? false
    : activeVariation
      ? activeVariation.inStock
      : product.inStock;
  const showPriceRange =
    !activeVariation &&
    Boolean(product.maxPrice && product.maxPrice > product.price);

  const variationPayload = activeVariation
    ? activeVariation.attributes
    : attributeGroups.map((group) => ({
        attribute: group.name,
        value: selectedOptions[group.name] ?? '',
      }));

  const availableOptionsSummary = attributeGroups
    .map((group) => {
      const validOpts = group.options.filter((opt) => optionHasStock(group.name, opt));
      return validOpts.length > 0 ? validOpts.join(', ') : null;
    })
    .filter(Boolean)
    .join(' · ');

  const selectableGroups = attributeGroups.filter((group) => group.options.length > 1);
  const fixedSpecs = attributeGroups.filter((group) => group.options.length === 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-5">
        <div className="flex items-baseline gap-3">
          <p className="font-serif text-3xl sm:text-4xl font-medium text-ink tabular-nums">
            {formatPrice(displayPrice, product.currencySymbol)}
            {showPriceRange && product.maxPrice
              ? ` – ${formatPrice(product.maxPrice, product.currencySymbol)}`
              : ''}
          </p>
          {displayRegular &&
          displayRegular > displayPrice &&
          !showPriceRange ? (
            <p className="text-base text-umber line-through tabular-nums">
              {formatPrice(displayRegular, product.currencySymbol)}
            </p>
          ) : null}
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              activeInStock ? 'bg-terracotta' : 'bg-crimson'
            }`}
          />
          <span className={activeInStock ? 'text-ink' : 'text-crimson'}>
            {hasMissingVariation
              ? 'Unavailable'
              : activeInStock
                ? 'In Stock'
                : 'Out of Stock'}
          </span>
        </div>
      </div>

      {fixedSpecs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {fixedSpecs.map((spec) => (
            <span
              key={spec.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3.5 py-1.5 text-xs text-umber"
            >
              <span className="font-semibold uppercase tracking-[0.12em] text-[10px]">
                {spec.name}:
              </span>
              <span className="font-medium text-ink">{spec.options[0]}</span>
            </span>
          ))}
        </div>
      ) : null}

      {selectableGroups.length > 0 ? (
        <div className="space-y-5">
          {selectableGroups.map((group) => (
            <fieldset key={group.name} className="space-y-2.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-umber">
                {group.name}:{' '}
                <span className="text-ink font-semibold">
                  {selectedOptions[group.name] || 'Select'}
                </span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = selectedOptions[group.name] === option;
                  const exists = optionHasVariation(group.name, option);
                  const inStockOpt = optionHasStock(group.name, option);
                  const isUnavailable = !exists || !inStockOpt;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={
                        isUnavailable ? `${option} (currently unavailable)` : option
                      }
                      onClick={() => handleOptionSelect(group.name, option)}
                      className={`min-h-[42px] px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-colors ${
                        isSelected && !isUnavailable
                          ? 'bg-ink text-inverse border-ink shadow-xs'
                          : isSelected && isUnavailable
                            ? 'bg-ink text-inverse border-ink'
                            : isUnavailable
                              ? 'bg-linen text-umber border-divider hover:border-ink'
                              : 'bg-paper text-ink border-divider hover:border-ink hover:text-terracotta'
                      }`}
                    >
                      <span>{option}</span>
                      {isUnavailable ? (
                        <span
                          className={`ml-1.5 text-[11px] uppercase tracking-[0.06em] ${
                            isSelected ? 'text-inverse/80' : 'text-umber'
                          }`}
                        >
                          (Unavailable)
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {hasMissingVariation ? (
            <p role="status" className="text-xs text-crimson leading-relaxed">
              This option is not configured for online ordering yet.
              {availableOptionsSummary
                ? ` Currently available: ${availableOptionsSummary}.`
                : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2">
        <div className="inline-flex items-center justify-between sm:justify-start rounded-full border border-divider bg-paper p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full flex items-center justify-center text-base text-ink hover:bg-linen disabled:text-umber/45 disabled:cursor-not-allowed cursor-pointer"
          >
            &minus;
          </button>
          <span
            aria-live="polite"
            className="min-w-[40px] text-center text-sm font-semibold text-ink tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            aria-label="Increase quantity"
            disabled={quantity >= 20}
            className="w-10 h-10 rounded-full flex items-center justify-center text-base text-ink hover:bg-linen disabled:text-umber/45 disabled:cursor-not-allowed cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex-1">
          <AddToCartButton
            productId={activeVariation?.id ?? product.id}
            medusaVariantId={activeVariation?.medusaVariantId}
            variation={
              variationPayload.length > 0 ? variationPayload : undefined
            }
            quantity={quantity}
            inStock={activeInStock}
            unavailableLabel={
              hasMissingVariation ? 'Option unavailable' : 'Out of stock'
            }
            size="lg"
            variant="primary"
            className="w-full rounded-full min-h-[50px]"
          />
        </div>
      </div>

      <div className="rounded-full border border-hairline bg-paper px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-umber">
        <span className="inline-flex items-center gap-2 font-mono">
          <HennaConeIcon size={14} className="text-terracotta shrink-0" />
          <span>
            {activeVariation?.sku
              ? `SKU: ${activeVariation.sku}`
              : 'Direct Studio Inventory · Batch-Synced'}
          </span>
        </span>
        <Link
          href="/cart"
          className="text-terracotta hover:text-terracotta-dark font-medium underline underline-offset-4 py-0.5"
        >
          View Shopping Bag &rarr;
        </Link>
      </div>

      <PincodeChecker subtotal={displayPrice * quantity} compact />
    </div>
  );
}

export function ProductDetailInteractive({
  product,
  headerChildren,
  footerChildren,
}: {
  product: StorefrontProduct;
  headerChildren?: React.ReactNode;
  footerChildren?: React.ReactNode;
}) {
  const [variationImage, setVariationImage] = useState<StorefrontImage | null>(
    null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <div className="lg:col-span-6 lg:sticky lg:top-24">
        <ProductGalleryLazy
          images={product.images}
          productName={product.name}
          preferredImage={variationImage}
        />
      </div>

      <div className="lg:col-span-6 space-y-6">
        {headerChildren}
        <VariantSelector
          product={product}
          onVariationChange={(variation) => {
            setVariationImage(variation?.image ?? null);
          }}
        />
        {footerChildren}
      </div>
    </div>
  );
}
