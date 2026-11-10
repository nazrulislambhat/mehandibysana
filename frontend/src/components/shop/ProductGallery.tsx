'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { StorefrontImage } from '@/types/storefront';
import { BotanicalHeroStudy } from '@/components/graphics/BotanicalIllustrations';

export interface ProductGalleryProps {
  images: StorefrontImage[];
  productName: string;
  preferredImage?: StorefrontImage | null;
}

export function ProductGallery({
  images,
  productName,
  preferredImage = null,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayedImage =
    preferredImage ?? images[selectedIndex] ?? images[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-hairline bg-linen">
        {displayedImage ? (
          <Image
            src={displayedImage.src}
            alt={displayedImage.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
            <BotanicalHeroStudy className="w-full max-w-[260px] h-auto" />
            <p className="text-xs uppercase tracking-[0.14em] text-umber mt-2">
              {productName}
            </p>
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div
          className="flex flex-wrap gap-3"
          role="group"
          aria-label="Product gallery thumbnails"
        >
          {images.map((img, idx) => {
            const isActive =
              displayedImage?.id === img.id ||
              (!preferredImage && idx === selectedIndex);
            return (
              <button
                key={`${img.id}-${idx}`}
                type="button"
                aria-pressed={isActive}
                aria-label={`View image ${idx + 1} of ${productName}`}
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-20 w-16 overflow-hidden rounded-xl border bg-linen cursor-pointer transition-all ${
                  isActive
                    ? 'border-ink ring-2 ring-ink/20'
                    : 'border-divider hover:border-ink'
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
