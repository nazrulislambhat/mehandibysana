'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BrandCrest } from '@/components/graphics/BrandMarks';

type CurtainPhase = 'idle' | 'covering' | 'revealing';

const COLUMN_INDICES = [0, 1, 2, 3, 4, 5] as const;
const COVER_NAVIGATE_DELAY_MS = 520;
const COVER_MIN_DURATION_MS = 820;
const REVEAL_DURATION_MS = 1120;
const STALL_FAILSAFE_MS = 2400;

export function RouteTransitionCurtain() {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() ?? ''}`;

  const [curtain, setCurtain] = useState<{ phase: CurtainPhase; seq: number }>({
    phase: 'idle',
    seq: 0,
  });
  const [hairline, setHairline] = useState<{ active: boolean; seq: number }>({
    active: false,
    seq: 0,
  });

  const phaseRef = useRef<CurtainPhase>('idle');
  const seqRef = useRef<number>(0);
  const coverStartedAtRef = useRef<number>(0);
  const pendingPathnameRef = useRef<string | null>(null);
  const lastPathnameRef = useRef<string>(pathname);
  const lastRouteKeyRef = useRef<string>(routeKey);
  const timersRef = useRef<number[]>([]);

  const clearCurtainTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const pushTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const triggerHairline = useCallback(() => {
    pushTimer(() => {
      setHairline((prev) => ({ active: true, seq: prev.seq + 1 }));
    }, 0);
    pushTimer(() => {
      setHairline((prev) => ({ ...prev, active: false }));
    }, 980);
  }, [pushTimer]);

  const startReveal = useCallback(() => {
    clearCurtainTimers();
    const seq = seqRef.current;
    phaseRef.current = 'revealing';
    pendingPathnameRef.current = null;
    document.documentElement.style.setProperty('--ck-nav-delay', '240ms');
    setCurtain({ phase: 'revealing', seq });

    pushTimer(() => {
      if (seqRef.current !== seq) return;
      phaseRef.current = 'idle';
      document.documentElement.style.setProperty('--ck-nav-delay', '0ms');
      setCurtain({ phase: 'idle', seq });
    }, REVEAL_DURATION_MS);
  }, [clearCurtainTimers, pushTimer]);

  // Cleanup all timers and CSS custom properties on unmount
  useEffect(() => {
    return () => {
      clearCurtainTimers();
      document.documentElement.style.setProperty('--ck-nav-delay', '0ms');
    };
  }, [clearCurtainTimers]);

  // Intercept internal cross-route link clicks to run CargoKite 6-column curtain
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      if (anchor.dataset.noCurtain === 'true') return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:')
      ) {
        return;
      }

      let dest: URL;
      try {
        dest = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (dest.origin !== window.location.origin) return;

      const currentPath = window.location.pathname;
      const currentFull = `${currentPath}${window.location.search}${window.location.hash}`;
      const nextFull = `${dest.pathname}${dest.search}${dest.hash}`;
      if (currentFull === nextFull) return;

      // Same-pathname query/hash transitions stay instant with just the hairline sweep
      if (dest.pathname === currentPath) {
        triggerHairline();
        return;
      }

      // Prevent instant Next.js route swap so the 6-column curtain sweeps shut cleanly
      event.preventDefault();

      clearCurtainTimers();
      const nextSeq = seqRef.current + 1;
      seqRef.current = nextSeq;
      phaseRef.current = 'covering';
      pendingPathnameRef.current = dest.pathname;
      coverStartedAtRef.current = performance.now();

      document.documentElement.style.setProperty('--ck-nav-delay', '240ms');
      setCurtain({ phase: 'covering', seq: nextSeq });

      // Prefetch destination immediately while blinds descend
      router.prefetch(nextFull);

      // Push route shortly before columns finish locking so swap happens invisibly behind cover
      pushTimer(() => {
        if (seqRef.current !== nextSeq) return;
        router.push(nextFull);
      }, COVER_NAVIGATE_DELAY_MS);

      // Failsafe unlock in case route stalls or redirects back to the exact same pathname
      pushTimer(() => {
        if (seqRef.current === nextSeq && phaseRef.current === 'covering') {
          startReveal();
        }
      }, STALL_FAILSAFE_MS);
    };

    const handlePopState = () => {
      if (phaseRef.current === 'covering') {
        startReveal();
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, clearCurtainTimers, pushTimer, startReveal, triggerHairline]);

  // Coordinate reveal once Next.js commits the incoming pathname
  useEffect(() => {
    const prevPathname = lastPathnameRef.current;
    const prevRouteKey = lastRouteKeyRef.current;
    lastPathnameRef.current = pathname;
    lastRouteKeyRef.current = routeKey;

    if (prevPathname === pathname) {
      if (prevRouteKey !== routeKey) {
        triggerHairline();
      }
      return;
    }

    if (phaseRef.current === 'covering') {
      const elapsed = performance.now() - coverStartedAtRef.current;
      const waitRemaining = Math.max(0, COVER_MIN_DURATION_MS - elapsed);
      const activeSeq = seqRef.current;

      pushTimer(() => {
        if (seqRef.current === activeSeq && phaseRef.current === 'covering') {
          startReveal();
        }
      }, waitRemaining);
      return;
    }

    // Back/forward popstate or programmatic router.push: show crisp hairline sweep
    triggerHairline();
  }, [pathname, routeKey, pushTimer, startReveal, triggerHairline]);

  const showCurtain = curtain.phase !== 'idle';

  return (
    <>
      {hairline.active ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px] overflow-hidden"
        >
          <div
            key={hairline.seq}
            className="route-progress-bar h-full w-full bg-terracotta shadow-[0_0_8px_rgba(217,84,30,0.45)]"
          />
        </div>
      ) : null}

      {showCurtain ? (
        <div
          id="route-transition-curtain"
          key={curtain.seq}
          data-phase={curtain.phase}
          aria-hidden="true"
          className="ck-curtain-wrapper"
        >
          <div className="ck-curtain-columns">
            {COLUMN_INDICES.map((idx) => (
              <div
                key={idx}
                className="ck-curtain-col"
                style={
                  {
                    '--col-cover-delay': `${idx * 45}ms`,
                    '--col-reveal-delay': `${idx * 55}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div className="ck-curtain-emblem">
            <BrandCrest
              tone="transparent-cream"
              size={68}
              decorative
              className="w-14 h-14 sm:w-[68px] sm:h-[68px]"
            />
            <span className="font-serif text-xs sm:text-sm tracking-[0.26em] uppercase text-inverse/90 mt-3">
              Mehandi by Sana
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
