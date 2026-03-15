'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';

/* ─────────────────────────────────────────────
   Constants — change these to update copy/links
───────────────────────────────────────────── */
const BRAND = {
  name: 'Mehendi by Sana',
  tagline: 'Mehendi artist · Srinagar, J&K || Bengaluru, KA',
  instagram: 'https://instagram.com/mehandibysana',
  igHandle: '@mehandibysana',
  phone: '+91 9149648717', // ← update
  email: 'sana@mehandibysana.com', // ← update
  shopUrl: 'https://mehandibysana.com/shop',
};

const HEADLINE_WORDS = ['Art.', 'Tradition.', 'Grace.'];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Animated cycling headline word */
function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HEADLINE_WORDS.length);
        setVisible(true);
      }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        display: 'inline-block',
        color: 'var(--accent)',
        fontStyle: 'italic',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        minWidth: '3ch',
      }}
    >
      {HEADLINE_WORDS[index]}
    </span>
  );
}

/** Thin animated divider line */
function Divider({ delay = '0s' }: { delay?: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 1,
        background: 'var(--accent)',
        transformOrigin: 'left',
        animation: `drawLine 0.9s ${delay} var(--ease-out) both`,
      }}
    />
  );
}

/** Dark / light toggle button */
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mbs_theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const initial = saved === 'dark' || (!saved && prefersDark);
    setDark(initial);
    document.documentElement.setAttribute(
      'data-theme',
      initial ? 'dark' : 'light',
    );
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute(
      'data-theme',
      next ? 'dark' : 'light',
    );
    localStorage.setItem('mbs_theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-2)',
        transition: 'border-color 0.25s, color 0.25s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          'var(--accent)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-2)';
      }}
    >
      {dark ? (
        /* Moon icon */
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        /* Sun icon */
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}

/** Email signup form */
function SignupForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [msg, setMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMsg('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    // ── Replace this with your actual signup endpoint (Mailchimp, Resend, etc.) ──
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('success');
    setMsg("You're on the list — we'll be in touch soon.");
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <p
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-2)',
          marginBottom: '1rem',
        }}
      >
        Get notified when we launch
      </p>

      <div
        style={{
          display: 'flex',
          gap: 0,
          border: '1px solid var(--border)',
          background: 'var(--bg-2)',
          transition: 'border-color 0.25s',
          maxWidth: 420,
        }}
        onFocusCapture={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            'var(--accent)')
        }
        onBlurCapture={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            'var(--border)')
        }
      >
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus('idle');
            setMsg('');
          }}
          placeholder="your@email.com"
          disabled={status === 'loading' || status === 'success'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0.85rem 1.1rem',
            fontSize: '0.9rem',
            color: 'var(--text)',
            fontWeight: 300,
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          style={{
            background: status === 'success' ? '#5a7a3a' : 'var(--accent)',
            border: 'none',
            color: '#FAF8F5',
            padding: '0.85rem 1.4rem',
            fontSize: '0.72rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 500,
            cursor:
              status === 'loading' || status === 'success'
                ? 'default'
                : 'pointer',
            transition: 'background 0.3s, opacity 0.25s',
            whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {status === 'loading' && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: 'spin 0.8s linear infinite' }}
            >
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <path d="M12 2a10 10 0 0110 10" />
            </svg>
          )}
          {status === 'success'
            ? 'Subscribed ✓'
            : status === 'loading'
              ? 'Sending…'
              : 'Notify me'}
        </button>
      </div>

      {msg && (
        <p
          style={{
            marginTop: '0.65rem',
            fontSize: '0.8rem',
            color: status === 'error' ? '#b94a48' : 'var(--accent)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {msg}
        </p>
      )}
    </form>
  );
}

/** Single contact link pill */
function ContactLink({
  href,
  icon,
  label,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  delay: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.82rem',
        color: hovered ? 'var(--accent)' : 'var(--text-2)',
        border: '1px solid',
        borderColor: hovered ? 'var(--accent)' : 'var(--border)',
        padding: '0.5rem 1rem',
        transition: 'color 0.25s, border-color 0.25s',
        animation: `fadeUp 0.7s ${delay} var(--ease-out) both`,
        letterSpacing: '0.04em',
      }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function ComingSoonPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Giant decorative letter ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          right: '-6vw',
          bottom: '-4vh',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18rem, 38vw, 52rem)',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1,
          color: 'var(--accent)',
          opacity: 0.035,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          animation: 'floatY 9s ease-in-out infinite',
        }}
      >
        S
      </div>

      {/* ── Thin top line ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            'linear-gradient(90deg, transparent 0%, var(--accent) 40%, var(--accent-light) 60%, transparent 100%)',
          opacity: 0.6,
          zIndex: 10,
        }}
      />

      {/* ── Header row ── */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeIn 0.8s ease both',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              color: 'var(--text)',
            }}
          >
            Mehendi{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>
              by Sana
            </span>
          </p>
          <p
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              marginTop: '0.15rem',
            }}
          >
            {BRAND.tagline}
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Main content — vertically centred ── */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '4rem 0 2rem',
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Label */}
          <p
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              animation: 'fadeUp 0.6s 0.1s var(--ease-out) both',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 32,
                height: 1,
                background: 'var(--accent)',
                transformOrigin: 'left',
                animation: 'drawLine 0.8s 0.3s var(--ease-out) both',
              }}
            />
            Something beautiful is coming
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 9vw, 6.5rem)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              marginBottom: '1.75rem',
              animation: 'fadeUp 0.7s 0.2s var(--ease-out) both',
            }}
          >
            Drawn with
            <br />
            intention.
            <br />
            <CyclingWord />
          </h1>

          {/* Divider */}
          <div
            style={{
              marginBottom: '1.75rem',
              animation: 'fadeUp 0.7s 0.3s var(--ease-out) both',
            }}
          >
            <Divider delay="0.5s" />
          </div>

          {/* Sub-copy */}
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
              color: 'var(--text-2)',
              lineHeight: 1.85,
              maxWidth: 480,
              fontWeight: 300,
              marginBottom: '2.75rem',
              animation: 'fadeUp 0.7s 0.35s var(--ease-out) both',
            }}
          >
            A new home for traditional bridal mehendi, contemporary henna art &
            curated products — thoughtfully crafted for every occasion.
            We&apos;re putting the finishing touches on. Leave your email and
            you&apos;ll be the first to know.
          </p>

          {/* Email signup */}
          <div
            style={{
              marginBottom: '3rem',
              animation: 'fadeUp 0.7s 0.45s var(--ease-out) both',
            }}
          >
            <SignupForm />
          </div>

          {/* Contact links */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            {/* Instagram */}
            <ContactLink
              href={BRAND.instagram}
              delay="0.55s"
              label={BRAND.igHandle}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              }
            />

            {/* Phone / WhatsApp */}
            <ContactLink
              href={`tel:${BRAND.phone.replace(/\s/g, '')}`}
              delay="0.62s"
              label={BRAND.phone}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              }
            />

            {/* Email */}
            <ContactLink
              href={`mailto:${BRAND.email}`}
              delay="0.69s"
              label={BRAND.email}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Footer row ── */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          position: 'relative',
          zIndex: 1,
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-soft)',
          animation: 'fadeIn 1s 0.8s ease both',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-3)',
            letterSpacing: '0.06em',
          }}
        >
          © {new Date().getFullYear()} Mehendi by Sana. All rights reserved.
        </p>

        <a
          href={BRAND.shopUrl}
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'color 0.25s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              'var(--accent)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              'var(--text-3)')
          }
        >
          Visit shop
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </footer>
    </main>
  );
}
