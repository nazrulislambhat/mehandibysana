import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-inverse focus:shadow-md"
    >
      Skip to main content
    </a>
  );
}

