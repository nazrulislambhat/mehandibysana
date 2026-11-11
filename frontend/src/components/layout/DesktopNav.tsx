'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SHOP_COLLECTIONS, STUDIO_NAV_ITEMS } from '@/components/layout/nav-data';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import { ChevronDownIcon, HennaConeIcon } from '@/components/graphics/BrandIcons';

type PanelPhase = 'closed' | 'opening' | 'open' | 'closing';

export function DesktopNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const shopTriggerRef = useRef<HTMLButtonElement>(null);

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const [megaState, setMegaState] = useState<{ phase: PanelPhase; pathname: string }>({
    phase: 'closed',
    pathname,
  });
  const megaPhase: PanelPhase =
    megaState.pathname === pathname ? megaState.phase : 'closed';

  const openTimerRef = useRef<number | null>(null);
  const closeDelayRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);

  const isMegaVisible = megaPhase !== 'closed';
  const isMegaExpanded = megaPhase === 'open';

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeDelayRef.current !== null) {
      window.clearTimeout(closeDelayRef.current);
      closeDelayRef.current = null;
    }
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  const openMegaMenu = useCallback(() => {
    clearTimers();
    setMegaState((prev) => {
      const activePhase = prev.pathname === pathname ? prev.phase : 'closed';
      return {
        phase: activePhase === 'open' || activePhase === 'opening' ? 'open' : 'opening',
        pathname,
      };
    });
    openTimerRef.current = window.requestAnimationFrame(() => {
      openTimerRef.current = window.requestAnimationFrame(() => {
        setMegaState({ phase: 'open', pathname });
      });
    });
  }, [clearTimers, pathname]);

  const closeMegaMenu = useCallback(
    (immediate = false) => {
      clearTimers();
      if (immediate) {
        setMegaState({ phase: 'closed', pathname });
        return;
      }
      setMegaState((prev) => {
        const activePhase = prev.pathname === pathname ? prev.phase : 'closed';
        if (activePhase === 'closed') return { phase: 'closed', pathname };
        return { phase: 'closing', pathname };
      });
      unmountTimerRef.current = window.setTimeout(() => {
        setMegaState({ phase: 'closed', pathname });
      }, 220);
    },
    [clearTimers, pathname],
  );

  const scheduleCloseMegaMenu = useCallback(() => {
    if (closeDelayRef.current !== null) {
      window.clearTimeout(closeDelayRef.current);
    }
    closeDelayRef.current = window.setTimeout(() => {
      closeMegaMenu(false);
    }, 150);
  }, [closeMegaMenu]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Close mega-menu on Escape
  useEffect(() => {
    if (!isMegaVisible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMegaMenu(false);
        shopTriggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMegaVisible, closeMegaMenu]);

  const activeHref =
    STUDIO_NAV_ITEMS.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/' && pathname?.startsWith(`${item.href}/`)) ||
        (item.href === '/shop' && pathname?.startsWith('/product/')),
    )?.href ?? null;

  const targetHref = hoveredHref ?? (isMegaVisible ? '/shop' : activeHref);

  const updateIndicator = useCallback(() => {
    if (!targetHref || !navRef.current) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    const targetEl = itemRefs.current[targetHref];
    if (!targetEl) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    setIndicator({
      left: targetEl.offsetLeft,
      width: targetEl.offsetWidth,
      visible: true,
    });
  }, [targetHref]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      className="hidden md:flex items-center h-full"
      onMouseLeave={() => {
        setHoveredHref(null);
        if (isMegaVisible) {
          scheduleCloseMegaMenu();
        }
      }}
    >
      <nav
        ref={navRef}
        aria-label="Primary navigation"
        className="relative flex items-center gap-1 rounded-full border border-divider/80 bg-canvas px-1.5 py-1.5 shadow-[0_2px_12px_rgba(17,17,17,0.04)]"
      >
        {/* Sliding highlight rail under hovered or active tab */}
        <span
          aria-hidden="true"
          style={{
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            width: `${indicator.width}px`,
            opacity: indicator.visible && hoveredHref && hoveredHref !== activeHref ? 1 : 0,
            transition:
              'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
          }}
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-full border border-terracotta/50 bg-canvas"
        />

        {STUDIO_NAV_ITEMS.map((item) => {
          const isCurrent = activeHref === item.href;
          const isShop = item.href === '/shop';
          const isShopOpenState = isShop && isMegaExpanded;
          const isActivePill = isCurrent || isShopOpenState;

          if (isShop) {
            return (
              <div
                key={item.href}
                ref={(el) => {
                  itemRefs.current[item.href] = el;
                }}
                onMouseEnter={() => {
                  setHoveredHref(item.href);
                  openMegaMenu();
                }}
                className={`relative z-10 flex items-center rounded-full pl-3.5 pr-1.5 py-1.5 transition-all duration-200 ${
                  isActivePill
                    ? 'bg-ink text-inverse shadow-xs'
                    : 'text-ink hover:text-terracotta'
                }`}
              >
                <Link
                  href={item.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => closeMegaMenu(false)}
                  className="inline-flex items-baseline gap-1.5 text-[13px] font-medium pr-1"
                >
                  <span
                    className={`font-serif text-[11px] italic transition-colors ${
                      isActivePill ? 'text-terracotta-on-ink' : 'text-umber'
                    }`}
                  >
                    {item.index}
                  </span>
                  <span>{item.label}</span>
                </Link>
                <button
                  ref={shopTriggerRef}
                  type="button"
                  aria-expanded={isMegaExpanded}
                  aria-controls="desktop-shop-mega-menu"
                  aria-label={
                    isMegaExpanded
                      ? 'Collapse shop collections menu'
                      : 'Expand shop collections menu'
                  }
                  onClick={() => {
                    if (isMegaExpanded) {
                      closeMegaMenu(false);
                    } else {
                      openMegaMenu();
                    }
                  }}
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full cursor-pointer transition-colors ${
                    isActivePill
                      ? 'text-inverse/80 hover:text-terracotta-on-ink hover:bg-inverse/10'
                      : 'text-umber hover:text-terracotta hover:bg-linen'
                  }`}
                >
                  <ChevronDownIcon
                    size={12}
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isMegaExpanded ? 'rotate-180 text-terracotta-on-ink' : ''
                    }`}
                  />
                </button>
              </div>
            );
          }

          return (
            <div
              key={item.href}
              ref={(el) => {
                itemRefs.current[item.href] = el;
              }}
              onMouseEnter={() => {
                setHoveredHref(item.href);
                if (isMegaVisible) {
                  scheduleCloseMegaMenu();
                }
              }}
              className="relative z-10 flex items-center"
            >
              <Link
                href={item.href}
                prefetch={item.prefetch}
                aria-current={isCurrent ? 'page' : undefined}
                className={`group inline-flex items-baseline gap-1.5 rounded-full px-3.5 lg:px-4 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isCurrent
                    ? 'bg-ink text-inverse shadow-xs'
                    : 'text-ink hover:text-terracotta'
                }`}
              >
                <span
                  className={`font-serif text-[11px] italic transition-colors ${
                    isCurrent
                      ? 'text-terracotta-on-ink'
                      : 'text-umber group-hover:text-terracotta'
                  }`}
                >
                  {item.index}
                </span>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Animated Shop Apothecary Mega-Panel */}
      {isMegaVisible ? (
        <div
          id="desktop-shop-mega-menu"
          data-state={megaPhase}
          onMouseEnter={() => {
            clearTimers();
            setMegaState({ phase: 'open', pathname });
          }}
          onMouseLeave={() => {
            setHoveredHref(null);
            scheduleCloseMegaMenu();
          }}
          className="mega-menu-surface absolute inset-x-0 top-full z-50 px-6 pt-3 pointer-events-auto"
        >
          <div className="mx-auto max-w-[980px] rounded-2xl border border-divider bg-paper shadow-[0_24px_60px_-15px_rgba(17,17,17,0.18)] overflow-hidden">
            <div className="grid grid-cols-12">
              {/* Left 7 columns: Curated Collections */}
              <div className="col-span-7 p-6 lg:p-7 border-r border-hairline">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-umber">
                    Apothecary &amp; Product Collections
                  </span>
                  <Link
                    href="/shop"
                    onClick={() => closeMegaMenu(false)}
                    className="text-xs font-medium text-terracotta hover:text-terracotta-dark inline-flex items-center gap-1"
                  >
                    <span>View full catalog</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {SHOP_COLLECTIONS.map((col, idx) => (
                    <Link
                      key={col.href}
                      href={col.href}
                      onClick={() => closeMegaMenu(false)}
                      style={
                        {
                          '--mega-delay': `${idx * 35}ms`,
                        } as React.CSSProperties
                      }
                      className="mega-menu-item group flex items-start justify-between gap-4 rounded-xl border border-transparent hover:border-hairline hover:bg-linen/70 px-3.5 py-2.5"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className="font-serif text-xs italic text-terracotta/90 shrink-0">
                          {col.index}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-medium text-ink group-hover:text-terracotta transition-colors leading-snug">
                              {col.title}
                            </span>
                            {col.badge ? (
                              <span className="inline-flex items-center rounded-full border border-terracotta/45 bg-paper px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta">
                                {col.badge}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-umber line-clamp-1 mt-0.5">
                            {col.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        aria-hidden="true"
                        className="mt-1 text-umber/60 group-hover:text-terracotta group-hover:translate-x-0.5 transition-all text-sm shrink-0"
                      >
                        &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right 5 columns: Botanical Craft & Pincode Dispatch Spotlight */}
              <div className="col-span-5 bg-linen/75 p-6 lg:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                      <HennaConeIcon size={14} className="shrink-0" />
                      <span>Srinagar &amp; Bengaluru Batch</span>
                    </span>
                    <BotanicalSprig className="w-12 h-4" />
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-ink leading-snug">
                    100% Chemical-Free Bridal &amp; Hair Henna
                  </h3>
                  <p className="text-xs text-umber leading-relaxed mt-2">
                    Hand-sifted Sojat henna leaf blended with pure eucalyptus &amp; clove oils. Rolled to order and shipped nationwide from Srinagar &amp; Bengaluru.
                  </p>

                  <div className="mt-4 rounded-xl border border-hairline bg-paper/90 p-3.5 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                      Batch Dispatch Standards
                    </p>
                    <div className="flex items-center justify-between text-xs text-umber">
                      <span>Fresh Rolling</span>
                      <span className="font-medium text-ink">1–2 business days</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-umber">
                      <span>Coverage</span>
                      <span className="font-medium text-ink">Pan-India Courier</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-umber">
                      <span>Delivery Estimate</span>
                      <span className="font-medium text-terracotta">PIN check on product &amp; bag</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between gap-3">
                  <Link
                    href="/services"
                    onClick={() => closeMegaMenu(false)}
                    className="text-xs font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4"
                  >
                    Book Bridal Session
                  </Link>
                  <LinkButton
                    href="/shop"
                    variant="primary"
                    size="sm"
                    onClick={() => closeMegaMenu(false)}
                    className="rounded-lg text-xs min-h-[36px] py-2"
                  >
                    Shop All 19 Items
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
