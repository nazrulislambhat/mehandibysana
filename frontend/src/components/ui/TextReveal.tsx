'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface TextRevealProps {
  children: React.ReactNode;
  variant?: 'line' | 'fade';
  delayMs?: number;
  immediate?: boolean;
  as?: 'div' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
}

export function TextReveal({
  children,
  variant = 'fade',
  delayMs = 0,
  immediate = false,
  as = 'div',
  className = '',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealState, setRevealState] = useState<'idle' | 'pending' | 'revealed'>('idle');

  useEffect(() => {
    if (immediate) return;

    const node = ref.current;
    if (!node) return;

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      const id = requestAnimationFrame(() => setRevealState('revealed'));
      return () => cancelAnimationFrame(id);
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
      {
        rootMargin: '0px 0px -24px 0px',
        threshold: 0.04,
      },
    );

    observer.observe(node);

    const handleScrollFallback = () => {
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight + 60) {
        setRevealState('revealed');
        observer.disconnect();
      }
    };

    window.addEventListener('scroll', handleScrollFallback, { passive: true });
    const safetyTimer = setTimeout(() => {
      setRevealState('revealed');
      observer.disconnect();
    }, 1800);

    return () => {
      cancelAnimationFrame(startId);
      clearTimeout(safetyTimer);
      window.removeEventListener('scroll', handleScrollFallback);
      observer.disconnect();
    };
  }, [immediate]);

  const Tag = as;

  if (immediate) {
    if (as === 'div' && !className) {
      return <>{children}</>;
    }
    return <Tag className={className || undefined}>{children}</Tag>;
  }

  if (variant === 'line') {
    const isPending = revealState === 'pending';
    const isRevealed = revealState === 'revealed';

    return (
      <div ref={ref} className="overflow-hidden">
        <Tag
          data-reveal-pending={isPending ? 'true' : 'false'}
          data-revealed={isRevealed ? 'true' : 'false'}
          style={{ transitionDelay: isRevealed ? `${delayMs}ms` : '0ms' }}
          className={`reveal-line-inner ${className}`.trim()}
        >
          {children}
        </Tag>
      </div>
    );
  }

  const isPending = revealState === 'pending';
  const isRevealed = revealState === 'revealed';

  return (
    <div
      ref={ref}
      data-reveal-pending={isPending ? 'true' : 'false'}
      data-revealed={isRevealed ? 'true' : 'false'}
      style={{ transitionDelay: isRevealed ? `${delayMs}ms` : '0ms' }}
      className={`reveal-fade-block ${className}`.trim()}
    >
      {as === 'div' ? children : <Tag className="contents">{children}</Tag>}
    </div>
  );
}
