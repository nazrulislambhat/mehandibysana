'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Camera, MessageSquare, X, ChevronRight } from 'lucide-react';

export function FloatingContactBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
      className="pointer-events-none fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none"
      aria-label="Direct contact and social channels"
    >
      {/* Expanded Popup Options Card */}
      <div
        id="floating-contact-menu"
        role="dialog"
        aria-label="Contact options"
        aria-hidden={!isOpen}
        className={`mb-3 w-[290px] sm:w-[320px] rounded-2xl border border-white/15 bg-[#181818]/95 text-[#fceee3] shadow-[0_18px_45px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md p-4 transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none invisible'
        }`}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-brand-green shrink-0 animate-pulse"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                Connect with Sana
              </p>
            </div>
            <p className="text-xs text-[#fceee3]/75 mt-0.5">
              Kashmir, J&amp;K &middot; Bengaluru, Karnataka
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close contact popup"
            className="p-1 rounded-full text-[#fceee3]/60 hover:text-[#fceee3] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
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
            className="group flex items-center justify-between p-2.5 rounded-xl border border-[#25D366]/25 bg-[#25D366]/15 hover:bg-[#25D366]/25 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <MessageCircle className="w-3 h-3" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:text-[#25D366] transition-colors leading-tight">
                  WhatsApp
                </p>
                <p className="text-[11px] text-[#fceee3]/70 leading-tight mt-0.5">
                  +91 91496 48717 &middot; Instant chat
                </p>
              </div>
            </div>
            <span className="text-[#25D366] group-hover:translate-x-1 transition-transform duration-200">
              <ChevronRight className="w-3 h-3" />
            </span>
          </a>

          {/* Instagram option */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-between p-2.5 rounded-xl border border-[#E1306C]/25 bg-gradient-to-r from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 hover:from-[#f09433]/25 hover:via-[#dc2743]/25 hover:to-[#bc1888]/25 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E1306C]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Camera className="w-3 h-3" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:text-[#bc1888] transition-colors leading-tight">
                  Instagram
                </p>
                <p className="text-[11px] text-[#fceee3]/70 leading-tight mt-0.5">
                  @mehandibysana &middot; DM &amp; feed
                </p>
              </div>
            </div>
            <span className="text-[#bc1888] group-hover:translate-x-1 transition-transform duration-200">
              <ChevronRight className="w-3 h-3" />
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
        className="pointer-events-auto group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#181818] text-white hover:bg-terracotta border-2 border-white/20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] hover:shadow-[0_14px_30px_-5px_rgba(184,83,42,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
      >
        {/* Pulsing online indicator dot */}
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-green border-2 border-[#181818]" />
        </span>

        {/* Morphing icon between chat and close */}
        <span
          className={`transition-transform duration-300 ease-out flex items-center justify-center ${
            isOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'
          }`}
        >
          {isOpen ? (
            <X className="w-3 h-3" />
          ) : (
            <MessageSquare className="w-3 h-3" />
          )}
        </span>

        {/* Hover label tooltip (visible on desktop when collapsed) */}
        {!isOpen && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-[#181818]/95 text-white border border-white/10 shadow-lg px-3 py-1.5 text-xs font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden sm:block"
          >
            Chat with Sana
          </span>
        )}
      </button>
    </div>
  );
}
