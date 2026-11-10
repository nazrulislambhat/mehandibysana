import React from 'react';
import { LinkButton } from '@/components/ui/Button';

export interface FeedbackStateProps {
  title: string;
  description: string;
  tone?: 'neutral' | 'error';
  action?: {
    label: string;
    href: string;
  };
}

export function FeedbackState({
  title,
  description,
  tone = 'neutral',
  action,
}: FeedbackStateProps) {
  const isError = tone === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`rounded-2xl border bg-paper p-8 md:p-12 text-center max-w-2xl mx-auto ${
        isError ? 'border-crimson/35' : 'border-hairline'
      }`}
    >
      <p className="font-serif text-2xl font-medium text-ink mb-2">{title}</p>
      <p className="text-sm md:text-base text-umber leading-relaxed max-w-lg mx-auto">
        {description}
      </p>
      {action ? (
        <div className="mt-6">
          <LinkButton
            href={action.href}
            variant="secondary"
            size="md"
            className="rounded-full"
          >
            {action.label}
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}
