import React from 'react';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import {
  BotanicalDivider,
  ServiceMotifIcon,
} from '@/components/graphics/BotanicalIllustrations';

export const metadata: Metadata = {
  title: 'Mehndi Services & Appointments',
  description:
    'Bespoke bridal mehndi appointments, celebration henna bookings, and small-batch botanical preparations by Mehandi by Sana.',
};

interface ServicePackage {
  id: string;
  slug: string;
  motif: 'bridal' | 'events' | 'botanical';
  featured?: boolean;
  eyebrow: string;
  title: string;
  summary: string;
  ratePlaceholder: string;
  includes: string[];
}

const SERVICE_TIERS: ServicePackage[] = [
  {
    id: 'bridal',
    slug: 'bridal',
    motif: 'bridal',
    featured: true,
    eyebrow: '01 · Signature',
    title: 'Bridal Mehndi',
    summary:
      'From Intimate Bridal forearms and feet mandalas to Royal Kashmiri full-elbow coverage with Mughal archways, peacocks, and personalized bride & groom initials.',
    ratePlaceholder: '3–8 hrs · Custom quote by coverage',
    includes: [
      'Forearms-to-fingertips or full-elbow & mid-calf bridal coverage',
      'Pre-event motif & placement consultation with Sana',
      '100% organic hand-rolled cones, sealant spray & aftercare balm',
    ],
  },
  {
    id: 'events',
    slug: 'events',
    motif: 'events',
    eyebrow: '02 · Gatherings',
    title: 'Events & Celebrations',
    summary:
      'Engagement ceremonies, Eid festivities, family celebrations, and bridal troupe bookings (bride plus up to 10 family members) at your home or venue.',
    ratePlaceholder: 'Srinagar, Bangalore & destination',
    includes: [
      'Solo artist or Sana + assistant artists for larger guest lists',
      'Kashmiri Chinar, floral lotus, Arabic vine, or minimalist cuffs',
      'Fresh botanical paste formulated with soothing lavender & eucalyptus',
    ],
  },
  {
    id: 'botanical',
    slug: 'botanical',
    motif: 'botanical',
    eyebrow: '03 · Studio & Training',
    title: 'Custom Batches & Workshops',
    summary:
      'Freshly rolled bulk cone orders for wedding favors and events, alongside our 15-day Mehandi Masterclass covering paste chemistry, cone rolling, and fine linework.',
    ratePlaceholder: '2-day fresh dispatch · 15-day course',
    includes: [
      'Freshly sifted small-batch paste rolled to 0.38mm precision tips',
      'Custom event cone bundles or complete DIY self-care kits',
      '15-day structured masterclass curriculum (₹3,500 course fee)',
    ],
  },
];

const CONSULTATION_STEPS = [
  {
    num: '01',
    step: 'Step 01',
    title: 'Share Date & Occasion',
    detail:
      'Submit your celebration date, venue city (Srinagar, Bangalore, Jammu & Kashmir, or destination), and preferred coverage tier through our booking inquiry form.',
  },
  {
    num: '02',
    step: 'Step 02',
    title: 'Design & Availability Review',
    detail:
      'Sana and our studio coordinator respond within 24 hours to confirm calendar availability, share tailored package rates, and plan bespoke motifs.',
  },
  {
    num: '03',
    step: 'Step 03',
    title: 'Fresh Paste & Application',
    detail:
      'Your cones are mixed and rolled fresh ahead of your date using triple-sifted organic henna leaf powder and pure essential oils, complete with 48-hour stain aftercare guidance.',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Asymmetric Header */}
      <section
        aria-labelledby="services-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-12 md:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  02 &middot; Services &amp; Bookings
                </p>
              </div>
              <TextReveal variant="line">
                <h1
                  id="services-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1]"
                >
                  Unhurried henna artistry for milestone gatherings.
                </h1>
              </TextReveal>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <p className="text-sm md:text-base text-umber leading-relaxed">
                Operating from our studios in Srinagar (Baghat Barzullah) and Bangalore, we serve brides and celebrations across India and destination venues using exclusively 100% organic, PPD-free henna paste.
              </p>
              <LinkButton
                href="/contact"
                variant="accent"
                size="md"
                className="rounded-full"
              >
                Inquire for Availability &rarr;
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Column Service Offerings (Signature Tier 01 in Ink Black Contrast) */}
      <section
        aria-labelledby="offerings-heading"
        className="editorial-container py-16 md:py-24"
      >
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-2">
            Offerings
          </p>
          <h2
            id="offerings-heading"
            className="font-serif text-3xl md:text-4xl font-medium text-ink"
          >
            Appointments &amp; Studio Packages
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {SERVICE_TIERS.map((tier, idx) => {
            const isFeatured = Boolean(tier.featured);

            return (
              <TextReveal
                key={tier.id}
                variant="fade"
                delayMs={idx * 80}
                className="flex"
              >
                <article
                  className={`relative overflow-hidden w-full rounded-2xl p-7 md:p-8 flex flex-col justify-between gap-7 transition-colors ${
                    isFeatured
                      ? 'bg-ink text-inverse shadow-[0_22px_50px_-18px_rgba(17,17,17,0.34)]'
                      : 'border border-hairline bg-paper hover:border-ink/40'
                  }`}
                >
                  {isFeatured ? (
                    <div
                      aria-hidden="true"
                      className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
                    />
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          isFeatured ? 'text-terracotta' : 'text-umber'
                        }`}
                      >
                        {tier.eyebrow}
                      </span>
                      <ServiceMotifIcon variant={tier.motif} />
                    </div>

                    <h3
                      className={`font-serif text-2xl sm:text-[1.75rem] font-medium mb-2 ${
                        isFeatured ? 'text-inverse' : 'text-ink'
                      }`}
                    >
                      {tier.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-terracotta mb-4">
                      {tier.ratePlaceholder}
                    </p>
                    <p
                      className={`text-sm leading-relaxed mb-6 ${
                        isFeatured ? 'text-inverse/80' : 'text-umber'
                      }`}
                    >
                      {tier.summary}
                    </p>

                    <ul
                      className={`space-y-2.5 border-t pt-5 text-sm ${
                        isFeatured
                          ? 'border-inverse/15 text-inverse/90'
                          : 'border-hairline text-ink/90'
                      }`}
                    >
                      {tier.includes.map((line, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className="text-terracotta mt-0.5"
                          >
                            &bull;
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <LinkButton
                    href={`/contact?service=${encodeURIComponent(tier.slug)}`}
                    variant={isFeatured ? 'primary' : 'secondary'}
                    size="md"
                    className="w-full rounded-full"
                  >
                    Request {tier.title}
                  </LinkButton>
                </article>
              </TextReveal>
            );
          })}
        </div>
      </section>

      <BotanicalDivider />

      {/* Split 5/7 Booking Process Section */}
      <section
        aria-labelledby="process-heading"
        className="editorial-container py-16 md:py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-3">
              How It Works
            </p>
            <TextReveal variant="line">
              <h2
                id="process-heading"
                className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight mb-4"
              >
                From initial date check to finished stain.
              </h2>
            </TextReveal>
            <p className="text-sm md:text-base text-umber leading-relaxed">
              We recommend reserving bridal dates 4–8 weeks in advance during peak wedding seasons, and 2–3 weeks ahead for engagement, Eid, or custom bulk cone orders.
            </p>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {CONSULTATION_STEPS.map((item, idx) => (
              <TextReveal key={item.step} variant="fade" delayMs={idx * 80}>
                <div className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 flex items-start gap-5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ink font-serif text-xs italic text-inverse shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1.5">
                      {item.step}
                    </p>
                    <h3 className="font-serif text-2xl font-medium text-ink mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-umber leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </TextReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
