'use client';

import React, { useEffect, useRef, useState } from 'react';

const BRAND_LETTERS = 'MEHANDI BY SANA'.split('');

export function FooterBrandWordmark() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<'idle' | 'pending' | 'revealed'>('idle');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      setRevealState('revealed');
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
      className="footer-wordmark-frame w-full select-none py-2"
    >
      {/* Decorative Atelier Hallmark Header */}
      <div className="flex items-center justify-center gap-3 mb-3 text-xs font-mono uppercase tracking-[0.24em] text-terracotta">
        <span aria-hidden="true" className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-terracotta/40" />
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rotate-45 bg-terracotta" />
          Organic Henna Studio
          <span className="w-1.5 h-1.5 rotate-45 bg-terracotta" />
        </span>
        <span aria-hidden="true" className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-terracotta/40" />
      </div>

      {/* Main Kinetic Interactive Brand Heading */}
      <p
        aria-label="Mehandi By Sana"
        onMouseLeave={() => setHoveredIndex(null)}
        className="m-0 font-serif font-medium uppercase tracking-[-0.015em] leading-[0.88] text-[clamp(2.1rem,8.6cqi,7.25rem)] flex items-baseline justify-center whitespace-nowrap w-full cursor-default"
      >
        <span className="sr-only">MEHANDI BY SANA</span>
        <span aria-hidden="true" className="inline-flex items-baseline whitespace-nowrap">
          {BRAND_LETTERS.map((char, charIndex) => {
            const distance =
              hoveredIndex !== null ? Math.abs(hoveredIndex - charIndex) : null;
            const isHovered = distance === 0;
            const isNear = distance === 1;

            return (
              <span
                key={`brand-${charIndex}`}
                onMouseEnter={() => setHoveredIndex(charIndex)}
                className="footer-brand-letter inline-block transition-all duration-300"
                data-reveal-pending={revealState === 'pending' ? 'true' : 'false'}
                data-revealed={revealState === 'revealed' ? 'true' : 'false'}
                style={{
                  transform: isHovered
                    ? 'translate3d(0, -10px, 0) scale(1.12)'
                    : isNear
                      ? 'translate3d(0, -4px, 0) scale(1.04)'
                      : 'translate3d(0, 0, 0) scale(1)',
                  color: isHovered
                    ? '#d4683b'
                    : isNear
                      ? '#fceee3'
                      : 'rgba(252, 238, 227, 0.45)',
                  textShadow: isHovered
                    ? '0 0 28px rgba(212, 104, 59, 0.65)'
                    : isNear
                      ? '0 0 16px rgba(252, 238, 227, 0.25)'
                      : 'none',
                  transitionDelay:
                    hoveredIndex === null && revealState === 'revealed'
                      ? `${charIndex * 26}ms`
                      : '0ms',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </span>
      </p>

      {/* Sub-label hallmark */}
      <p className="text-center text-xs font-mono tracking-[0.22em] text-plaque-ink/75 uppercase mt-3">
        Kashmir &middot; Bengaluru &middot; Pan-India Dispatch
      </p>
    </div>
  );
}
