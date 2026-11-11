import React from 'react';
import { TextReveal } from '@/components/ui/TextReveal';
import { LinkButton } from '@/components/ui/Button';
import { BotanicalSprig, ServiceMotifIcon } from '@/components/graphics/BotanicalIllustrations';
import { LineDotRightHorizontal } from 'lucide-react';
interface ServiceItem {
  id: string;
  number: string;
  motif: 'bridal' | 'events' | 'botanical';
  title: string;
  summary: string;
  note: string;
}

const SERVICES_OVERVIEW: ServiceItem[] = [
  {
    id: 'bridal',
    number: '01',
    motif: 'bridal',
    title: 'Bridal Mehandi',
    summary:
      'Full arms and feet coverage featuring traditional Kashmiri, Mughal, and botanical motifs tailored to your wedding celebrations, applied with ultra-fine 0.38mm hand-rolled organic cones.',
    note: '3–8 hrs · Custom quote',
  },
  {
    id: 'events',
    number: '02',
    motif: 'events',
    title: 'Events & Celebrations',
    summary:
      'Bespoke henna sessions for engagements, Eid festivities, and family gatherings—personally applied by Sana (with independent guest artists arranged on request) at your home or venue.',
    note: 'Srinagar, Bengaluru & destination',
  },
  {
    id: 'bespoke',
    number: '03',
    motif: 'botanical',
    title: 'Custom Batches & Workshops',
    summary:
      'Freshly rolled bulk event cone bundles, DIY self-care kits, and 15-day hands-on mehandi masterclass training in paste formulation, cone rolling, and bridal linework.',
    note: '2-day fresh dispatch',
  },
];

export function ServicesSection() {
  return (
    <section
      aria-labelledby="services-heading"
      className="border-b border-hairline bg-canvas"
    >
      <div className="editorial-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Sticky Left Editorial Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <TextReveal variant="fade">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  Services
                </p>
              </div>
            </TextReveal>

            <TextReveal variant="line" delayMs={60}>
              <h2
                id="services-heading"
                className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight mb-4"
              >
                Appointments &amp; Botanical Care
              </h2>
            </TextReveal>

            <BotanicalSprig className="mb-5" />

            <TextReveal variant="fade" delayMs={120}>
              <p className="text-sm md:text-base text-umber leading-relaxed mb-6">
                Every appointment begins with a personalized motif consultation and freshly mixed organic henna paste—completely free from PPD, synthetic dyes, or chemical solvents.
              </p>
              <LinkButton
                href="/services"
                variant="ink"
                size="md"
                className="rounded-md"
              >
                Explore all services <LineDotRightHorizontal className='w-4 h-4' />
              </LinkButton>
            </TextReveal>
          </div>

          {/* Stacked Architectural Index Cards */}
          <div className="lg:col-span-8 space-y-4">
            {SERVICES_OVERVIEW.map((service, idx) => (
              <TextReveal key={service.id} variant="fade" delayMs={idx * 90}>
                <article className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-start transition-colors hover:border-ink/40">
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ink font-serif text-xs italic text-inverse shrink-0">
                      {service.number}
                    </span>
                    <ServiceMotifIcon variant={service.motif} />
                  </div>

                  <div className="sm:col-span-10">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
                      <h3 className="font-serif text-2xl md:text-[1.75rem] font-medium text-ink">
                        {service.title}
                      </h3>
                      <span className="inline-flex items-center rounded-full border border-terracotta/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-terracotta">
                        {service.note}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                      {service.summary}
                    </p>
                  </div>
                </article>
              </TextReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
