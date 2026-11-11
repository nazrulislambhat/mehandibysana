'use client';

import React, { useSyncExternalStore } from 'react';
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  toggleTheme,
} from '@/lib/theme';
import { CrescentMoonIcon, SunBurstIcon } from '@/components/graphics/BrandIcons';

export interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  surface?: 'canvas' | 'plaque';
  className?: string;
}

export function ThemeToggle({
  variant = 'icon',
  surface = 'canvas',
  className = '',
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    const isPlaque = surface === 'plaque';
    return (
      <div
        role="group"
        aria-label="Color theme"
        data-theme-toggle="segmented"
        className={`inline-flex items-center rounded-full p-1 ${
          isPlaque
            ? 'border border-plaque-ink/20 bg-plaque'
            : 'border border-divider bg-paper'
        } ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={!isDark}
          data-theme-option="light"
          className={`inline-flex items-center gap-1.5 min-h-[24px] rounded-full px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
            !isDark
              ? isPlaque
                ? 'bg-plaque-ink text-plaque shadow-xs'
                : 'bg-ink text-inverse shadow-xs'
              : isPlaque
                ? 'text-plaque-ink/75 hover:text-plaque-ink'
                : 'text-umber hover:text-ink'
          }`}
        >
          <SunBurstIcon
            size={14}
            className={
              !isDark
                ? isPlaque
                  ? 'text-terracotta-dark shrink-0'
                  : 'text-terracotta-on-ink shrink-0'
                : 'shrink-0'
            }
          />
          
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          data-theme-option="dark"
          className={`inline-flex items-center gap-1.5 min-h-[24px] rounded-full px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
            isDark
              ? isPlaque
                ? 'bg-plaque-ink text-plaque shadow-xs'
                : 'bg-ink text-inverse shadow-xs'
              : isPlaque
                ? 'text-plaque-ink/75 hover:text-plaque-ink'
                : 'text-umber hover:text-ink'
          }`}
        >
          <CrescentMoonIcon
            size={14}
            className={
              isDark
                ? isPlaque
                  ? 'text-terracotta-dark shrink-0'
                  : 'text-terracotta-on-ink shrink-0'
                : 'shrink-0'
            }
          />
      
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      data-theme-toggle="icon"
      data-active-theme={theme}
      className={`group relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-divider/80 bg-canvas text-ink shadow-[0_2px_10px_rgba(17,17,17,0.03)] hover:border-terracotta hover:text-terracotta transition-all cursor-pointer ${className}`}
    >
      <span
        aria-hidden="true"
        className="relative flex items-center justify-center w-5 h-5"
      >
        <SunBurstIcon
          size={17}
          className={`absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
          }`}
        />
        <CrescentMoonIcon
          size={17}
          className={`absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            !isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-45 pointer-events-none'
          }`}
        />
      </span>
    </button>
  );
}
