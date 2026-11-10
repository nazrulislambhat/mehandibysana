'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ''}?${searchParams?.toString() ?? ''}`;

  const isFirstMount = useRef(true);
  const timerRef = useRef<number | null>(null);
  const [sweepKey, setSweepKey] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger brief sweeping Burnt Orange hairline when a new route commits
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    const startTimer = window.setTimeout(() => {
      setSweepKey((prev) => prev + 1);
      setIsVisible(true);
      timerRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 540);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [routeKey]);

  // Also capture immediate internal link clicks so feedback begins right on click
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

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const dest = new URL(anchor.href, window.location.href);
        if (dest.origin !== window.location.origin) return;
        const currentFull = `${window.location.pathname}${window.location.search}`;
        const nextFull = `${dest.pathname}${dest.search}`;
        if (currentFull === nextFull) return;

        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
        }
        setSweepKey((prev) => prev + 1);
        setIsVisible(true);
        timerRef.current = window.setTimeout(() => {
          setIsVisible(false);
        }, 700);
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px] overflow-hidden"
    >
      <div
        key={sweepKey}
        className="route-progress-bar h-full w-full bg-terracotta shadow-[0_0_8px_rgba(217,84,30,0.45)]"
      />
    </div>
  );
}

