'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SHOP_COLLECTIONS,
  STUDIO_NAV_ITEMS,
  type StudioNavItem,
} from '@/components/layout/nav-data';
import { LinkButton } from '@/components/ui/Button';
import {
  BotanicalHeroStudy,
  BotanicalSprig,
  ServiceMotifIcon,
} from '@/components/graphics/BotanicalIllustrations';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import { CloseCrossIcon } from '@/components/graphics/BrandIcons';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

type MenuPhase = 'closed' | 'opening' | 'open' | 'closing';

const emptySubscribe = () => () => {};

export function StudioMenu() {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [menuState, setMenuState] = useState<{ phase: MenuPhase; pathname: string }>({
    phase: 'closed',
    pathname,
  });
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  const phase: MenuPhase = menuState.pathname === pathname ? menuState.phase : 'closed';

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const isVisible = phase !== 'closed';
  const isExpanded = phase === 'opening' || phase === 'open';

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Sync default preview item with active route whenever drawer opens
  const syncPreviewToRoute = useCallback(() => {
    const matchedIdx = STUDIO_NAV_ITEMS.findIndex(
      (item) =>
        pathname === item.href ||
        (item.href !== '/' && pathname?.startsWith(`${item.href}/`)) ||
        (item.href === '/shop' && pathname?.startsWith('/product/')),
    );
    setPreviewIndex(matchedIdx >= 0 ? matchedIdx : 0);
  }, [pathname]);

  const openMenu = useCallback(() => {
    clearTimers();
    syncPreviewToRoute();
    setMenuState({ phase: 'opening', pathname });
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setMenuState({ phase: 'open', pathname });
      });
    });
  }, [clearTimers, syncPreviewToRoute, pathname]);

  const closeMenu = useCallback(
    (restoreFocus = false) => {
      clearTimers();
      setMenuState((prev) => {
        const activePhase = prev.pathname === pathname ? prev.phase : 'closed';
        if (activePhase === 'closed') return { phase: 'closed', pathname };
        return { phase: 'closing', pathname };
      });
      closeTimerRef.current = window.setTimeout(() => {
        setMenuState({ phase: 'closed', pathname });
        if (restoreFocus) {
          triggerRef.current?.focus();
        }
      }, 310);
    },
    [clearTimers, pathname],
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Lock body scroll & manage Escape + initial focus while open
  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (phase === 'open') {
      closeButtonRef.current?.focus({ preventScroll: true });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, phase, closeMenu]);

  const activePreview: StudioNavItem =
    STUDIO_NAV_ITEMS[previewIndex] ?? STUDIO_NAV_ITEMS[0];

  const overlayContent =
    isClient && isVisible
      ? createPortal(
          <div
            id="studio-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mehandi by Sana navigation menu"
            className="fixed inset-0 z-50 flex flex-col"
          >
            {/* Backdrop scrim with smooth open/close fade */}
            <div
              data-state={phase}
              onClick={() => closeMenu(true)}
              aria-hidden="true"
              className="menu-backdrop fixed inset-0 bg-black/60 backdrop-blur-[3px]"
            />

            {/* Sliding & fading editorial parchment drawer */}
            <div
              data-state={phase}
              className="studio-menu-panel relative z-10 flex flex-col w-full max-h-[100dvh] overflow-y-auto bg-canvas border-b border-divider shadow-[0_28px_70px_-15px_rgba(17,17,17,0.28)]"
            >
              {/* Subtle botanical arch watermark */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-6 bottom-6 w-[240px] sm:w-[300px] opacity-[0.06] select-none"
              >
                <BotanicalHeroStudy className="w-full h-auto" />
              </div>

              {/* Drawer Top Bar aligned to 73px Header */}
              <div className="h-[73px] shrink-0 border-b border-hairline">
                <div className="editorial-container h-full flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href="/"
                      onClick={() => closeMenu(false)}
                      className="inline-flex items-center gap-2.5 font-serif text-xl sm:text-2xl font-medium tracking-tight text-ink hover:text-terracotta py-1.5"
                    >
                      <BrandCrest tone="auto-badge" size={32} decorative className="shrink-0" />
                      <span>Mehandi by Sana</span>
                    </Link>
                    <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-hairline bg-linen/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-umber">
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                      Navigation Index
                    </span>
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => closeMenu(true)}
                    aria-label="Close navigation menu"
                    className="inline-flex items-center gap-2.5 min-h-[44px] px-4 rounded-full border border-divider bg-paper text-sm font-medium text-ink hover:bg-linen hover:border-ink cursor-pointer"
                  >
                    <span>Close</span>
                    <CloseCrossIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Main Split Editorial Menu Body */}
              <div className="editorial-container relative py-3.5 sm:py-10 lg:py-12 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-8 lg:gap-12 items-start">
                  {/* Left Column: Staggered Masked Serif Navigation */}
                  <nav
                    aria-label="Site chapters"
                    className="lg:col-span-7 flex flex-col divide-y divide-hairline/70 border-y border-hairline/70"
                  >
                    {STUDIO_NAV_ITEMS.map((item, idx) => {
                      const isCurrent =
                        pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(`${item.href}/`)) ||
                        (item.href === '/shop' && pathname?.startsWith('/product/'));
                      const isHighlighted = previewIndex === idx;

                      const openDelay = `${idx * 50}ms`;
                      const closeDelay = `${(STUDIO_NAV_ITEMS.length - 1 - idx) * 28}ms`;

                      return (
                        <div key={item.href} className="overflow-hidden py-1 sm:py-3">
                          <Link
                            href={item.href}
                            prefetch={item.prefetch}
                            aria-current={isCurrent ? 'page' : undefined}
                            onMouseEnter={() => setPreviewIndex(idx)}
                            onFocus={() => setPreviewIndex(idx)}
                            onClick={() => closeMenu(false)}
                            style={
                              {
                                '--stagger-open': openDelay,
                                '--stagger-close': closeDelay,
                              } as React.CSSProperties
                            }
                            className="studio-menu-link-inner group w-full justify-between gap-4 py-0.5 sm:py-1"
                          >
                            <div className="flex items-baseline gap-4 sm:gap-6">
                              <span
                                className={`font-serif text-sm sm:text-base italic transition-colors ${
                                  isCurrent || isHighlighted
                                    ? 'text-terracotta'
                                    : 'text-umber/70 group-hover:text-terracotta'
                                }`}
                              >
                                {item.index}
                              </span>
                              <span
                                className={`font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight leading-[1.08] transition-all duration-300 ${
                                  isCurrent
                                    ? 'text-terracotta'
                                    : 'text-ink group-hover:text-terracotta group-hover:translate-x-2'
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isCurrent ? (
                                <span className="inline-flex items-center rounded-full border border-terracotta/45 bg-paper px-2.5 py-0.5 text-[11px] font-medium text-terracotta">
                                  Current
                                </span>
                              ) : (
                                <span className="hidden sm:inline text-xs text-umber/80 group-hover:text-ink transition-colors">
                                  {item.eyebrow}
                                </span>
                              )}
                              <span
                                aria-hidden="true"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-transparent group-hover:border-divider group-hover:bg-paper text-umber group-hover:text-terracotta group-hover:translate-x-0.5 transition-all"
                              >
                                &rarr;
                              </span>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </nav>

                  {/* Right Column: Interactive Desktop Chapter Spotlight + Mobile Quick Collections */}
                  <div className="studio-menu-aside lg:col-span-5 flex flex-col gap-5">
                    {/* Interactive Preview Card (Desktop & Tablet) */}
                    <div className="hidden sm:block rounded-2xl border border-divider bg-paper/95 p-6 lg:p-7 shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                          {activePreview.index} &middot; {activePreview.eyebrow}
                        </span>
                        <ServiceMotifIcon
                          variant={activePreview.motif}
                          className="w-7 h-7 shrink-0"
                        />
                      </div>

                      <h2 className="font-serif text-2xl lg:text-3xl font-medium text-ink leading-snug">
                        {activePreview.label}
                      </h2>
                      <p className="text-sm text-umber leading-relaxed mt-2.5">
                        {activePreview.description}
                      </p>

                      <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between gap-3">
                        <Link
                          href={activePreview.href}
                          onClick={() => closeMenu(false)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:text-terracotta-dark"
                        >
                          <span>{activePreview.ctaLabel}</span>
                          <span aria-hidden="true">&rarr;</span>
                        </Link>
                        <BotanicalSprig className="w-11 h-4" />
                      </div>
                    </div>

                    {/* Quick Apothecary Collections */}
                    <div className="rounded-2xl border border-hairline bg-linen/75 p-3.5 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-umber mb-2">
                        Apothecary Collections
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {SHOP_COLLECTIONS.map((collection) => (
                          <Link
                            key={collection.href}
                            href={collection.href}
                            onClick={() => closeMenu(false)}
                            className="inline-flex items-center gap-1.5 min-h-[30px] sm:min-h-[36px] rounded-full border border-divider bg-paper px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-ink hover:border-terracotta hover:text-terracotta transition-colors"
                          >
                            <span>{collection.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Primary Navigation Actions */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <LinkButton
                        href="/shop"
                        variant="primary"
                        size="md"
                        onClick={() => closeMenu(false)}
                        className="min-h-[42px] sm:min-h-[46px] rounded-xl text-xs sm:text-sm px-3 sm:px-6"
                      >
                        Shop Products
                      </LinkButton>
                      <LinkButton
                        href="/contact"
                        variant="secondary"
                        size="md"
                        onClick={() => closeMenu(false)}
                        className="min-h-[42px] sm:min-h-[46px] rounded-xl text-xs sm:text-sm px-3 sm:px-6"
                      >
                        Book Mehandi
                      </LinkButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Editorial Footer */}
              <div className="border-t border-hairline bg-linen/50 py-3 pb-4 sm:py-3.5">
                <div className="editorial-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-umber">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Srinagar &amp; Bangalore &middot; 100% Chemical-Free Botanical Henna</span>
                    <span className="font-medium text-ink hidden md:inline">
                      Pan-India Courier &amp; Speed Post Dispatch
                    </span>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-umber">
                      Appearance
                    </span>
                    <ThemeToggle variant="segmented" surface="canvas" />
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls="studio-navigation-drawer"
        aria-label={isExpanded ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => {
          if (isExpanded) {
            closeMenu(false);
          } else {
            openMenu();
          }
        }}
        className={`group inline-flex md:hidden items-center gap-2 min-h-[42px] px-3.5 rounded-full border text-[13px] font-medium transition-all cursor-pointer ${
          isExpanded
            ? 'border-terracotta-solid bg-terracotta-solid text-on-accent'
            : 'border-plaque-border bg-plaque text-plaque-ink hover:bg-terracotta-solid hover:border-terracotta-solid hover:text-on-accent'
        }`}
      >
        <span className="hidden sm:inline tracking-tight">
          {isExpanded ? 'Close' : 'Menu'}
        </span>

        {/* Morphing 2-line to X icon */}
        <span
          aria-hidden="true"
          className="relative inline-flex items-center justify-center w-5 h-5"
        >
          <span
            style={{
              transform: isExpanded
                ? 'translateY(0px) rotate(45deg)'
                : 'translateY(-3.5px) rotate(0deg)',
              transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="absolute block w-4 h-[1.6px] rounded-full bg-current"
          />
          <span
            style={{
              transform: isExpanded
                ? 'translateY(0px) rotate(-45deg)'
                : 'translateY(3.5px) rotate(0deg)',
              transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="absolute block w-4 h-[1.6px] rounded-full bg-current"
          />
        </span>
      </button>

      {overlayContent}
    </>
  );
}
