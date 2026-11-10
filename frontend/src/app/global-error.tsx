'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  resolvePreferredTheme,
  subscribeTheme,
} from '@/lib/theme';

const PRODUCTION_MONOGRAM_120_PATH =
  'M49.2 40.5C49.9 39.9 50.4 39.8 51.2 40.5C51.4 41 51.4 41.5 51.5 41.9C55.5 44.2 61.4 37.2 60.7 33.4C58.8 34.5 57.6 36.7 55 35.6C55.6 33.6 57.1 32.2 56.4 30C55.2 25.7 50.1 24.6 46.7 26.9C45.1 28 44.1 29.5 43.3 31.1C41.5 35.1 43.5 41 45.2 44.7C47.8 50.4 51.9 55.2 55 60.5C56.8 63.6 58.4 67 59.5 70.4C60 72.1 60.4 73.8 61 75.4C65 74.3 69 73.8 73 72.5C74.7 71.9 76.8 71.4 77.6 69.6C77.5 69.1 77.3 68.7 77.2 68.3C78.9 67.5 79.2 69.1 80.3 69.8C81.1 68.7 80.5 66.1 79 65.8C78.4 65.6 77.9 66.2 77.3 66.1C76.4 64.7 78.1 63.8 79.4 64.1C81.4 64.6 82 67.2 81.9 68.9C81.5 73.7 76.4 75.3 72.7 76.5C72.8 77.3 72.7 77.9 72 78.4C71.5 78 71.2 77.5 70.6 77.3C68.3 76.3 63.8 76.2 61.5 77.3C61.3 79.1 61.8 81 61.6 82.8C61 87.6 58.9 94.8 55.2 98.4C53.1 100.4 50.3 102 47.3 100.4C44.4 98.8 43.9 95.5 44.1 92.5C44.4 86.2 50.2 80.8 55.3 77.7C56.4 77 57.7 76.7 58.7 76.1C58.6 73.8 57.5 71.2 56.6 69.1C54.5 63.8 51.6 59 48.1 54.4C46.1 51.8 43.4 48.9 39.9 49.7C38 48 40.5 46.6 41.7 45.6C41.4 44.4 40.7 43.3 40.3 42.1C39.2 39 38.7 35.7 38.9 32.4C38.9 32 39.2 31.6 39.3 31.1C39.6 29.4 39.9 27.8 40.7 26.3C43.5 20.6 50.3 18 56.2 20.1C65.6 23.6 65.4 37.6 57.4 42.3C55.3 43.5 48.1 44.9 49.2 40.5ZM48.1 98.1C50.8 99.7 54 97.9 55.4 95.3C57.7 91.3 59.2 86.8 59.2 82.1C59.2 80.9 59.5 79.2 59 78.1C54.7 79.1 47.3 85.9 46.2 90.3C45.5 93 45.4 96.4 48.1 98.1Z';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const activeTheme = useSyncExternalStore(
    subscribeTheme,
    () => {
      const domTheme = getThemeSnapshot();
      if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
        return domTheme;
      }
      return resolvePreferredTheme();
    },
    getServerThemeSnapshot,
  );
  const isDark = activeTheme === 'dark';

  useEffect(() => {
    console.error('[Mehandi by Sana Global Error]:', error);
  }, [error]);

  return (
    <html
      lang="en"
      data-theme={activeTheme}
      style={{ colorScheme: activeTheme }}
      suppressHydrationWarning
    >
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: isDark ? '#181818' : '#ffffff',
          color: isDark ? '#fffee9' : '#111111',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '580px',
            width: '100%',
            border: `1px solid ${isDark ? '#333333' : '#e5e5e5'}`,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: isDark ? '#242424' : '#ffffff',
            boxShadow: isDark
              ? '0 24px 60px -20px rgba(0, 0, 0, 0.55)'
              : '0 24px 60px -20px rgba(17, 17, 17, 0.16)',
          }}
        >
          <div
            style={{
              backgroundColor: '#111111',
              color: '#fceee3',
              padding: '28px 32px',
              borderTop: '3px solid #c67d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#e5a365',
                }}
              >
                Mehandi by Sana &middot; Recovery Mode
              </p>
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'Georgia, serif',
                  fontSize: '30px',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                We hit an unexpected application error.
              </h1>
            </div>
            <svg
              width="52"
              height="52"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <defs>
                <linearGradient id="mbs-ge-gold" x1="60" y1="16" x2="60" y2="104" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ebb073" />
                  <stop offset="50%" stopColor="#c67d48" />
                  <stop offset="100%" stopColor="#9e5427" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="114" height="114" rx="28" fill="#052225" stroke="#c67d48" strokeWidth="2" />
              <circle cx="60" cy="60" r="46" stroke="#e5a365" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2.5 5" />
              <path
                d={PRODUCTION_MONOGRAM_120_PATH}
                transform="translate(60 60) scale(0.80) translate(-60 -60)"
                fill="url(#mbs-ge-gold)"
                fillRule="evenodd"
              />
            </svg>
          </div>

          <div style={{ padding: '28px 32px' }}>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: '15px',
                lineHeight: 1.65,
                color: isDark ? '#b5b0aa' : '#525252',
              }}
            >
              Please retry refreshing the application shell. If you were completing an order or checking tracking details, your bag state stays preserved in browser storage.
            </p>

            {error?.digest ? (
              <p
                style={{
                  margin: '0 0 20px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? '#202020' : '#f7f7f7',
                  border: `1px solid ${isDark ? '#2d2d2d' : '#e5e5e5'}`,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: isDark ? '#b5b0aa' : '#525252',
                }}
              >
                Diagnostic Digest: {error.digest}
              </p>
            ) : null}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  backgroundColor: isDark ? '#c44916' : '#d9541e',
                  color: '#fffaf5',
                  border: `1px solid ${isDark ? '#c44916' : '#d9541e'}`,
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reload View
              </button>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  backgroundColor: isDark ? '#202020' : '#ffffff',
                  color: isDark ? '#fffee9' : '#111111',
                  border: `1px solid ${isDark ? '#424242' : '#a3a3a3'}`,
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
