'use client';

import React, { useEffect, useRef, useState } from 'react';

const BRAND_LETTERS = 'MEHANDIBYSANA'.split('');

export function FooterBrandWordmark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<'idle' | 'pending' | 'revealed'>('idle');

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96) {
      const rafId = requestAnimationFrame(() => setRevealState('revealed'));
      return () => cancelAnimationFrame(rafId);
    }

    const startId = requestAnimationFrame(() => {
      setRevealState('pending');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealState('revealed');
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '0px 0px 24px 0px', threshold: 0.04 }
    );

    observer.observe(node);

    const safetyTimer = setTimeout(() => {
      setRevealState('revealed');
      observer.disconnect();
    }, 2200);

    return () => {
      cancelAnimationFrame(startId);
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="footer-wordmark-frame w-full pointer-events-none select-none overflow-hidden"
    >
      <p
        aria-label="Mehandi by Sana"
        className="m-0 font-sans font-semibold uppercase tracking-[-0.015em] leading-[0.84] text-[clamp(2rem,10.2cqi,9.75rem)] text-plaque-ink/[0.07] flex items-baseline justify-center whitespace-nowrap w-full"
      >
        <span className="sr-only">MEHANDI BY SANA</span>
        <span aria-hidden="true" className="inline-flex items-baseline whitespace-nowrap">
          {BRAND_LETTERS.map((char, charIndex) => (
            <span
              key={`brand-${charIndex}`}
              className="footer-brand-letter"
              data-reveal-pending={revealState === 'pending' ? 'true' : 'false'}
              data-revealed={revealState === 'revealed' ? 'true' : 'false'}
              style={{
                transitionDelay:
                  revealState === 'revealed' ? `${charIndex * 28}ms` : '0ms',
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </p>
    </div>
  );
}
