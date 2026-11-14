'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * WhatsApp official icon SVG
 */
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

/**
 * Instagram official glyph SVG
 */
function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/**
 * Chat bubble trigger icon
 */
function ChatBubbleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Close / X icon
 */
function CloseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Chevron right arrow
 */
function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function FloatingContactBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const whatsappUrl = `https://wa.me/919149648717?text=${encodeURIComponent(
    'Hi Sana, I would like to inquire about your mehandi services and products.'
  )}`;
  const instagramUrl = 'https://www.instagram.com/mehandibysana';

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none"
      aria-label="Direct contact and social channels"
    >
      {/* Expanded Popup Options Card */}
      <div
        id="floating-contact-menu"
        role="dialog"
        aria-label="Contact options"
        aria-hidden={!isOpen}
        className={`mb-3 w-[290px] sm:w-[320px] rounded-2xl border border-hairline/80 bg-[var(--cl-white,#ffffff)] dark:bg-[var(--cl-bg-dark,#181818)] shadow-[0_18px_45px_-10px_rgba(0,0,0,0.3)] backdrop-blur-md p-4 transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-[var(--cl-green,#789904)] shrink-0 animate-pulse"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--cl-orange,#DD6013)]">
                Connect with Sana
              </p>
            </div>
            <p className="text-xs text-[var(--cl-txt,#3D3D3D)] dark:text-[var(--cl-txt-light,#DBCAB6)] mt-0.5">
              Srinagar &amp; Bengaluru Studio
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close contact popup"
            className="p-1 rounded-full text-umber hover:text-ink hover:bg-linen/60 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Options list */}
        <div className="mt-3 flex flex-col gap-2.5">
          {/* WhatsApp option */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-between p-2.5 rounded-xl border border-[#25D366]/20 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink group-hover:text-[#128C7E] transition-colors leading-tight">
                  WhatsApp
                </p>
                <p className="text-[11px] text-umber leading-tight mt-0.5">
                  +91 91496 48717 &middot; Instant chat
                </p>
              </div>
            </div>
            <span className="text-[#128C7E] group-hover:translate-x-1 transition-transform duration-200">
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </a>

          {/* Instagram option */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-between p-2.5 rounded-xl border border-[#E1306C]/20 bg-gradient-to-r from-[#f09433]/10 via-[#dc2743]/10 to-[#bc1888]/10 hover:from-[#f09433]/20 hover:via-[#dc2743]/20 hover:to-[#bc1888]/20 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1306C]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink group-hover:text-[#bc1888] transition-colors leading-tight">
                  Instagram
                </p>
                <p className="text-[11px] text-umber leading-tight mt-0.5">
                  @mehandibysana &middot; DM &amp; feed
                </p>
              </div>
            </div>
            <span className="text-[#bc1888] group-hover:translate-x-1 transition-transform duration-200">
              <ArrowRightIcon className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>

      {/* Main Floating Trigger Bubble */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="floating-contact-menu"
        aria-label={
          isOpen
            ? 'Close contact options'
            : 'Open contact options: Instagram and WhatsApp'
        }
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[var(--cl-bg-dark,#181818)] text-[var(--cl-white,#ffffff)] hover:bg-[var(--cl-orange,#DD6013)] border-2 border-[var(--cl-bg,#E7DDCF)]/40 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(221,96,19,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cl-orange,#DD6013)]"
      >
        {/* Pulsing online indicator dot */}
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cl-green,#789904)] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--cl-green,#789904)] border-2 border-[var(--cl-bg-dark,#181818)]" />
        </span>

        {/* Morphing icon between chat and close */}
        <span
          className={`transition-transform duration-300 ease-out flex items-center justify-center ${
            isOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'
          }`}
        >
          {isOpen ? (
            <CloseIcon className="w-6 h-6" />
          ) : (
            <ChatBubbleIcon className="w-6 h-6" />
          )}
        </span>

        {/* Hover label tooltip (visible on desktop when collapsed) */}
        {!isOpen && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[var(--cl-bg-dark,#181818)]/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-[var(--cl-white,#ffffff)] shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden sm:block"
          >
            Chat with Sana &middot; WhatsApp &amp; Instagram
          </span>
        )}
      </button>
    </div>
  );
}
