'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Mehandi by Sana Global Error]:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          color: '#111111',
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
            border: '1px solid #e5e5e5',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            boxShadow: '0 24px 60px -20px rgba(17, 17, 17, 0.16)',
          }}
        >
          <div
            style={{
              backgroundColor: '#111111',
              color: '#fceee3',
              padding: '28px 32px',
              borderTop: '3px solid #d9541e',
            }}
          >
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#d9541e',
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

          <div style={{ padding: '28px 32px' }}>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: '15px',
                lineHeight: 1.65,
                color: '#525252',
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
                  backgroundColor: '#f7f7f7',
                  border: '1px solid #e5e5e5',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#525252',
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
                  backgroundColor: '#d9541e',
                  color: '#fceee3',
                  border: '1px solid #d9541e',
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
                  backgroundColor: '#ffffff',
                  color: '#111111',
                  border: '1px solid #a3a3a3',
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
