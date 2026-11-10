'use client';

import React, { useState } from 'react';

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setFeedback('Please enter your email address.');
      return;
    }

    setStatus('submitting');
    setFeedback('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source: 'footer',
          companyWebsite,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setStatus('error');
        setFeedback(data.error || 'Could not save your email right now. Please try again.');
        return;
      }

      setStatus('success');
      setEmail('');
      setFeedback(
        data.alreadySubscribed
          ? 'You are already subscribed to the fresh-batch dispatch list.'
          : 'You are on the Studio Dispatch List for fresh Sojat henna drops & bridal dates.'
      );
    } catch {
      setStatus('error');
      setFeedback('Network error — please try again in a moment.');
    }
  }

  return (
    <div className="rounded-2xl border border-inverse/15 bg-inverse/[0.04] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          Fresh Batch Dispatch List
        </p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-inverse/55">
          Small-Batch Alerts
        </span>
      </div>

      <p className="text-xs text-inverse/75 leading-relaxed">
        Receive quiet studio notes when new 0.38mm cone harvests are rolled or Eid &amp; bridal slots open.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        {/* Honeypot anti-spam field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="footer-company-website">Company Website</label>
          <input
            id="footer-company-website"
            type="text"
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address for batch dispatch alerts
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-h-[42px] flex-1 rounded-full border border-inverse/20 bg-ink/80 px-4 py-2 text-xs text-inverse placeholder:text-inverse/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:border-terracotta"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center gap-1.5 min-h-[42px] shrink-0 rounded-full bg-terracotta px-5 py-2 text-xs font-medium text-inverse hover:bg-terracotta-dark disabled:opacity-60 transition-colors cursor-pointer"
          >
            <span>{status === 'submitting' ? 'Joining…' : 'Join Batch List'}</span>
            {status !== 'submitting' ? <span aria-hidden="true">&rarr;</span> : null}
          </button>
        </div>
      </form>

      {feedback ? (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`text-xs leading-relaxed ${
            status === 'error' ? 'text-[#fca5a5]' : 'text-inverse/90'
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}

