'use client';

import React, { useSyncExternalStore } from 'react';
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  toggleTheme,
} from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';

export interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'switch';
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

  if (variant === 'switch') {
    const isPlaque = surface === 'plaque';
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        onClick={() => toggleTheme()}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        data-theme-toggle="switch"
        className={`group relative inline-flex h-6 w-11 shrink-0 items-center cursor-pointer rounded-full border transition-colors duration-300 ease-in-out p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
          isDark
            ? 'border-terracotta/40 bg-terracotta shadow-[0_0_12px_rgba(217,84,30,0.3)]'
            : isPlaque
              ? 'border-plaque-ink/20 bg-plaque-ink/15 hover:bg-plaque-ink/25'
              : 'border-divider bg-paper hover:bg-linen'
        } ${className}`.trim()}
      >
        <span className="sr-only">
          {isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        </span>
        <span
          aria-hidden="true"
          className={`pointer-events-none flex h-4.5 w-4.5 items-center justify-center rounded-full bg-paper shadow-sm transition-transform duration-300 ease-in-out ${
            isDark
              ? 'translate-x-5 text-terracotta'
              : 'translate-x-0 text-umber'
          }`}
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5 text-terracotta shrink-0" />
          ) : (
            <Sun className="w-2.5 h-2.5 text-terracotta shrink-0" />
          )}
        </span>
      </button>
    );
  }

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
          aria-label="Light mode"
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
          <Sun
            className={`w-3 h-3 ${
              !isDark
                ? isPlaque
                  ? 'text-terracotta-dark shrink-0'
                  : 'text-terracotta-on-ink shrink-0'
                : 'shrink-0'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          data-theme-option="dark"
          aria-label="Dark mode"
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
          <Moon
            className={`w-3 h-3 ${
              isDark
                ? isPlaque
                  ? 'text-terracotta-dark shrink-0'
                  : 'text-terracotta-on-ink shrink-0'
                : 'shrink-0'
            }`}
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
        <Sun
          className={`w-3 h-3 absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
          }`}
        />
        <Moon
          className={`w-3 h-3 absolute transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            !isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-45 pointer-events-none'
          }`}
        />
      </span>
    </button>
  );
}
