'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

let hasCompletedInitialHydration = false;

function shouldAnimatePageReveal(): boolean {
  if (typeof window === 'undefined' || !hasCompletedInitialHydration) {
    return false;
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [isRevealing, setIsRevealing] = useState<boolean>(shouldAnimatePageReveal);

  useEffect(() => {
    hasCompletedInitialHydration = true;
  }, []);

  return (
    <div
      key={pathname}
      className={isRevealing ? 'page-reveal-enter' : undefined}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          setIsRevealing(false);
        }
      }}
    >
      {children}
    </div>
  );
}
