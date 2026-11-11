'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LineDotRightHorizontal } from 'lucide-react';

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
          : 'You are on the Fresh Batch Dispatch List for new Sojat henna drops & bridal dates.'
      );
    } catch {
      setStatus('error');
      setFeedback('Network error — please try again in a moment.');
    }
  }

  return (
    <div className="rounded-2xl border border-plaque-ink/15 bg-plaque-ink/[0.04] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          Fresh Batch Dispatch List
        </p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-plaque-ink/60">
          Small-Batch Alerts
        </span>
      </div>

      <p className="text-xs text-plaque-ink/75 leading-relaxed">
        Receive fresh-batch alerts when new 0.38mm cone harvests are rolled or Eid &amp; bridal slots open.
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
            className="min-h-[42px] flex-1 rounded-full border border-plaque-ink/20 bg-plaque px-4 py-2 text-xs text-plaque-ink placeholder:text-plaque-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:border-terracotta"
          />
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={status === 'submitting'}
            className="min-h-[42px] shrink-0 rounded-full text-xs"
          >
            <span>{status === 'submitting' ? 'Joining…' : 'Join List'}</span>
            {status !== 'submitting' ? <LineDotRightHorizontal className='w-4 h-4'/> : null}
          </Button>
        </div>
      </form>

      {feedback ? (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`text-xs leading-relaxed ${
            status === 'error' ? 'text-[#fca5a5]' : 'text-plaque-ink/90'
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}

