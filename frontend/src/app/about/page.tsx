import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TextReveal } from '@/components/ui/TextReveal';
import { LinkButton } from '@/components/ui/Button';
import {
  BotanicalDivider,
  BotanicalSprig,
} from '@/components/graphics/BotanicalIllustrations';
import { SanaBurqaAtelierPortrait } from '@/components/graphics/HennaArtworkPlates';

export const metadata: Metadata = {
  title: 'About the Studio',
  description:
    'Meet Sumaiya Rashid Magray (Sana) — Electronics & Communication Engineer turned Kashmir’s first freelance organic henna artist and botanical apothecary founder.',
};

const STUDIO_PILLARS = [
  {
    number: '01',
    title: 'Botanical Purity',
    body: 'Triple-cloth sifted 100% pure Rajasthani henna leaf powder blended with steam-distilled eucalyptus and lavender essential oils—zero PPD, chemical dyes, or synthetic solvents.',
  },
  {
    number: '02',
    title: 'Small-Batch Freshness',
    body: 'Every batch of paste, aftercare balm, and hair blend is mixed fresh in our Baghat Barzullah studio and hand-rolled into ultra-fine 0.38mm cones for reliable lawsone release.',
  },
  {
    number: '03',
    title: 'Unhurried Craft',
    body: 'From bespoke Kashmiri bridal architecture to intimate festive cuffs, each motif is planned around skin placement, natural stain oxidation, and calm celebration.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas pb-20 md:pb-28">
      {/* Crisp White Split 5/7 Botanical Study & Story Intro */}
      <section
        aria-labelledby="about-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <figure className="space-y-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[13rem] rounded-b-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.14)]">
                  <SanaBurqaAtelierPortrait className="w-full h-full" />
                  <div className="pointer-events-none absolute inset-3 rounded-t-[12rem] rounded-b-xl border border-ink/10" />
                </div>
                <figcaption className="text-xs font-semibold uppercase tracking-[0.14em] text-umber text-center">
                  Sumaiya Rashid Magray (Sana) &middot; Baghat Barzullah Atelier, Srinagar
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  04 &middot; About Mehandi by Sana
                </p>
              </div>
              <TextReveal variant="line">
                <h1
                  id="about-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1]"
                >
                  From electronics engineering to pioneering organic henna in Kashmir.
                </h1>
              </TextReveal>
              <BotanicalSprig />
              <p className="text-base md:text-lg text-ink leading-relaxed max-w-2xl">
                Founded in Srinagar by Sumaiya Rashid Magray (Sana)—an Electronics &amp; Communication Engineering graduate and Kashmir’s first freelance organic henna artist—Mehandi by Sana bridges custom bridal artistry with a small-batch botanical apothecary.
              </p>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                After researching the monoterpene chemistry of eucalyptus, cineol, and tea tree oils to optimize natural lawsone dye release, Sana replaced commercial chemical cones with freshly mixed, triple-sifted organic paste hand-rolled to a 0.38mm tip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ink Black Editorial Pull Quote Plaque */}
      <section className="editorial-container py-16 md:py-20">
        <TextReveal variant="fade">
          <figure className="relative overflow-hidden max-w-4xl mx-auto rounded-2xl bg-ink text-inverse p-8 sm:p-12 md:p-14 shadow-[0_24px_60px_-20px_rgba(17,17,17,0.3)]">
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
            />
            <span
              aria-hidden="true"
              className="block font-serif text-4xl leading-none text-terracotta mb-3"
            >
              &ldquo;
            </span>
            <blockquote className="font-serif text-2xl sm:text-3xl font-normal text-inverse leading-[1.4]">
              Henna was never meant to be instant, toxic, or skin-damaging. It is an ancient botanical ritual of celebration, cooling therapy, and fragrance. My goal was simple: prove that natural, pure organic henna creates a far deeper, richer mahogany stain than any chemical ever could.
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-inverse/15 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">
              &mdash; Sumaiya Rashid Magray (Sana) &middot;{' '}
              <span className="text-inverse/75 font-normal">Srinagar, Kashmir</span>
            </figcaption>
          </figure>
        </TextReveal>
      </section>

      <BotanicalDivider />

      {/* Three-Column Pillars Strip */}
      <section
        aria-labelledby="pillars-heading"
        className="editorial-container py-16 md:py-20"
      >
        <div className="max-w-xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-2">
            Craft Standards
          </p>
          <TextReveal variant="line">
            <h2
              id="pillars-heading"
              className="font-serif text-3xl md:text-4xl font-medium text-ink"
            >
              Three quiet commitments
            </h2>
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {STUDIO_PILLARS.map((pillar, idx) => (
            <TextReveal key={pillar.number} variant="fade" delayMs={idx * 80}>
              <article className="rounded-2xl border border-hairline bg-paper p-7 md:p-8 h-full transition-colors hover:border-ink/40">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ink font-serif text-xs italic text-inverse mb-5">
                  {pillar.number}
                </span>
                <h3 className="font-serif text-2xl font-medium text-ink mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-umber leading-relaxed">
                  {pillar.body}
                </p>
              </article>
            </TextReveal>
          ))}
        </div>

        {/* Verified Media Recognition Strip */}
        <div className="mt-16 pt-12 border-t border-hairline">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-2">
            Media &amp; Recognition
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-ink mb-6">
            Featured across Kashmir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-hairline bg-paper p-7 flex flex-col justify-between gap-4 hover:border-ink/40 transition-colors">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-umber mb-1.5">
                  Greater Kashmir
                </p>
                <p className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                  &ldquo;Engineering graduate breaks stereotypes with her henna art&rdquo;
                </p>
              </div>
              <a
                href="https://www.greaterkashmir.com/todays-paper/engineering-graduate-breaks-stereotypes-with-her-henna-art"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-terracotta/45 px-4 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta hover:text-inverse self-start transition-colors"
              >
                Read article &nearr;
              </a>
            </div>

            <div className="rounded-2xl border border-hairline bg-paper p-7 flex flex-col justify-between gap-4 hover:border-ink/40 transition-colors">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-umber mb-1.5">
                  Rising Kashmir
                </p>
                <p className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                  &ldquo;Watch engineering graduate Sumaiya Rashid Magray defies norms with her stunning henna art&rdquo;
                </p>
              </div>
              <a
                href="https://www.facebook.com/therisingkashmir/videos/watch-engineering-graduate-sumaiya-rashid-magray-defies-norms-with-her-stunning-/629453583286646/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-terracotta/45 px-4 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta hover:text-inverse self-start transition-colors"
              >
                Watch video feature &nearr;
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <LinkButton
              href="/shop"
              variant="primary"
              size="md"
              className="rounded-full"
            >
              Explore Products &rarr;
            </LinkButton>
            <LinkButton
              href="/services"
              variant="secondary"
              size="md"
              className="rounded-full"
            >
              View Services
            </LinkButton>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center min-h-[36px] text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1.5"
          >
            Connect with the studio &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
