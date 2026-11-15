'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface TextRevealProps {
  children: React.ReactNode;
  variant?: 'line' | 'fade';
  delayMs?: number;
  /**
   * If true, reveals immediately on mount/page change with no scroll threshold requirement.
   * Useful for above-the-fold hero and masthead content.
   */
  immediate?: boolean;
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  threshold?: number;
}

export function TextReveal({
  children,
  variant = 'fade',
  delayMs = 0,
  immediate = false,
  as = 'div',
  className = '',
  threshold = 0.08,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Check reduced motion
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      setIsRevealed(true);
      return;
    }

    // Reset state on path change so page change triggers reveal animation
    setIsRevealed(false);

    let isCancelled = false;

    // Fast check: If marked immediate OR already within the viewport on mount
    const rect = node.getBoundingClientRect();
    const inViewport =
      immediate ||
      (rect.top < window.innerHeight * 0.95 && rect.bottom > 0);

    if (inViewport) {
      const timer = setTimeout(() => {
        if (!isCancelled) {
          setIsRevealed(true);
        }
      }, delayMs + 50);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }

    // For below-the-fold elements: trigger on scroll via IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (!isCancelled) {
                setIsRevealed(true);
              }
            }, delayMs);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: '0px 0px -20px 0px',
        threshold,
      }
    );

    observer.observe(node);

    // Passive scroll listener fallback
    const handleScroll = () => {
      if (isCancelled) return;
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.95) {
        setIsRevealed(true);
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Safety timeout ensuring text is never permanently hidden
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        setIsRevealed(true);
        observer.disconnect();
      }
    }, Math.max(1600, delayMs + 1000));

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, delayMs, immediate, threshold]);

  const Tag = as;
  const isSpan = as === 'span';

  if (variant === 'line') {
    const WrapperTag = isSpan ? 'span' : 'div';
    return (
      <WrapperTag
        className={
          isSpan
            ? 'inline-block overflow-hidden align-top'
            : 'block overflow-hidden'
        }
      >
        <Tag
          ref={ref as any}
          data-revealed={isRevealed ? 'true' : 'false'}
          style={{
            transitionDelay: isRevealed ? `${delayMs}ms` : '0ms',
          }}
          className={`reveal-line-inner ${className}`.trim()}
        >
          {children}
        </Tag>
      </WrapperTag>
    );
  }

  return (
    <Tag
      ref={ref as any}
      data-revealed={isRevealed ? 'true' : 'false'}
      style={{
        transitionDelay: isRevealed ? `${delayMs}ms` : '0ms',
      }}
      className={`reveal-fade-block ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
