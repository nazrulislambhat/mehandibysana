import React from 'react';
import { TextReveal } from '@/components/ui/TextReveal';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import type { StorefrontReview } from '@/types/storefront';

interface RecognitionItem {
  id: string;
  quote: string;
  author: string;
  context: string;
  href?: string;
  linkLabel?: string;
}

const FOUNDER_STATEMENT: RecognitionItem = {
  id: 'founder-philosophy',
  quote:
    'Henna was never meant to be instant, toxic, or skin-damaging. It is an ancient botanical ritual of celebration, cooling therapy, and fragrance. My goal was simple: prove that natural, pure organic henna creates a far deeper, richer mahogany stain than any chemical ever could.',
  author: 'Sumaiya Rashid Magray (Sana)',
  context: 'Founder & Organic Henna Artist · Baghat Barzullah, Srinagar',
};

const PRESS_RECOGNITION: RecognitionItem[] = [
  {
    id: 'greater-kashmir',
    quote: 'Engineering graduate breaks stereotypes with her henna art',
    author: 'Greater Kashmir',
    context: 'Print & Digital Feature · Srinagar, Kashmir',
    href: 'https://www.greaterkashmir.com/todays-paper/engineering-graduate-breaks-stereotypes-with-her-henna-art',
    linkLabel: 'Read coverage',
  },
  {
    id: 'rising-kashmir',
    quote:
      'Watch engineering graduate Sumaiya Rashid Magray defies norms with her stunning henna art',
    author: 'Rising Kashmir',
    context: 'Video Spotlight · Kashmir',
    href: 'https://www.facebook.com/therisingkashmir/videos/watch-engineering-graduate-sumaiya-rashid-magray-defies-norms-with-her-stunning-/629453583286646/',
    linkLabel: 'Watch feature',
  },
];

export interface TestimonialsSectionProps {
  reviews?: StorefrontReview[];
}

export function TestimonialsSection({ reviews = [] }: TestimonialsSectionProps) {
  const hasLiveReviews = reviews.length > 0;

  const primaryFeature: RecognitionItem = hasLiveReviews
    ? {
        id: `wc-review-${reviews[0].id}`,
        quote: reviews[0].review,
        author: reviews[0].reviewer,
        context: `Verified Buyer · ${reviews[0].productName}`,
      }
    : FOUNDER_STATEMENT;

  const secondaryCards: RecognitionItem[] =
    reviews.length > 1
      ? reviews.slice(1, 3).map((r) => ({
          id: `wc-review-${r.id}`,
          quote: r.review,
          author: r.reviewer,
          context: `Verified Buyer · ${r.productName}`,
        }))
      : PRESS_RECOGNITION;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-b border-hairline bg-canvas"
    >
      <div className="editorial-container py-16 md:py-24">
        <div className="max-w-xl mb-12 md:mb-14">
          <TextReveal variant="fade">
            <div className="flex items-center gap-2 mb-3">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                {hasLiveReviews ? 'Verified Customer Reviews' : 'Press & Studio Ethos'}
              </p>
            </div>
          </TextReveal>
          <TextReveal variant="line" delayMs={60}>
            <h2
              id="testimonials-heading"
              className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight"
            >
              {hasLiveReviews
                ? 'Trusted by brides & artists'
                : 'Craftsmanship recognized across Kashmir'}
            </h2>
          </TextReveal>
        </div>

        {/* Ink Black Feature Pull Quote + Crisp White Compact Cards Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <TextReveal variant="fade" className="lg:col-span-6 flex">
            <figure className="relative overflow-hidden w-full rounded-2xl bg-ink text-inverse p-8 md:p-10 flex flex-col justify-between gap-8 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.3)]">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
              />
              <div>
                <BotanicalSprig className="mb-6 text-terracotta" />
                <blockquote className="font-serif text-2xl md:text-[1.8rem] font-normal text-inverse leading-[1.38]">
                  &ldquo;{primaryFeature.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="border-t border-inverse/15 pt-5">
                <p className="font-semibold text-sm text-inverse">
                  {primaryFeature.author}
                </p>
                <p className="text-xs text-inverse/70 mt-0.5">
                  {primaryFeature.context}
                </p>
              </figcaption>
            </figure>
          </TextReveal>

          <div className="lg:col-span-6 flex flex-col gap-6">
            {secondaryCards.map((item, idx) => (
              <TextReveal key={item.id} variant="fade" delayMs={(idx + 1) * 90}>
                <figure className="rounded-2xl bg-paper border border-hairline p-7 flex flex-col justify-between gap-5 transition-colors hover:border-ink/40">
                  <blockquote className="text-sm md:text-base text-ink leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="border-t border-hairline pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-ink">{item.author}</p>
                      <p className="text-xs text-umber mt-0.5">{item.context}</p>
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-terracotta/45 px-3 py-1 text-xs font-medium text-terracotta hover:bg-terracotta hover:text-inverse transition-colors"
                      >
                        {item.linkLabel || 'Read article'} &nearr;
                      </a>
                    ) : null}
                  </figcaption>
                </figure>
              </TextReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
