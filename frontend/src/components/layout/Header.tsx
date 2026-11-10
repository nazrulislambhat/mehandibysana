import React from 'react';
import Link from 'next/link';
import { CartBadge } from '@/components/layout/CartBadge';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { StudioMenu } from '@/components/layout/StudioMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-canvas/95 backdrop-blur-md">
      {/* Subtle dual-tone architectural top edge */}
      <div aria-hidden="true" className="h-[2.5px] w-full bg-ink relative">
        <span className="absolute left-0 top-0 h-full w-24 sm:w-40 bg-terracotta" />
      </div>

      <div className="editorial-container h-[74px] flex items-center justify-between gap-4 lg:gap-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 py-1.5 whitespace-nowrap"
        >
          <span className="flex items-center gap-2 font-serif text-[1.45rem] sm:text-[1.6rem] font-medium tracking-tight text-ink group-hover:text-terracotta transition-colors">
            <span>Mehandi by Sana</span>
          </span>
          <span className="hidden xl:inline-flex items-center gap-2 pl-3 border-l border-divider text-[10px] font-semibold uppercase tracking-[0.2em] text-umber">
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rotate-45 bg-terracotta transition-transform duration-300 group-hover:rotate-90"
            />
            <span>Srinagar Atelier</span>
          </span>
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-2 sm:gap-2.5">
          <CartBadge />
          <StudioMenu />
        </div>
      </div>
    </header>
  );
}
