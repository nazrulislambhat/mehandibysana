import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  buildAboutPageJsonLd,
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import { TextReveal } from '@/components/ui/TextReveal';
import { LinkButton } from '@/components/ui/Button';
import {
  BotanicalDivider,
  BotanicalSprig,
} from '@/components/graphics/BotanicalIllustrations';
import {
  BridalArchIcon,
  HennaConeIcon,
  PureBotanicalIcon,
  VerifiedHonorSealIcon,
} from '@/components/graphics/BrandIcons';
import { SanaBurqaAtelierPortrait } from '@/components/graphics/HennaArtworkPlates';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Sumaiya Rashid Magray (Sana) & Studio',
  description:
    'Meet Sumaiya Rashid Magray (Sana) — Electronics & Communication Engineer turned Kashmir’s pioneer in 100% PPD-free organic henna artistry, operating from Srinagar & Bangalore.',
  canonicalPath: '/about',
  keywords: [
    'Sumaiya Rashid Magray',
    'Mehandi by Sana story',
    'Kashmir organic henna pioneer',
    'Srinagar Bangalore henna studio',
    'Maenz 2019 Kashmir',
  ],
});

interface AwardHonorItem {
  number: string;
  category: string;
  title: string;
  description: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
}

const AWARDS_AND_HONORS: AwardHonorItem[] = [
  {
    number: '01',
    category: 'Print & Digital Feature',
    title: 'Greater Kashmir',
    description:
      '“Engineering graduate breaks stereotypes with her henna art” — feature spotlighting Sana’s journey from electronics engineering into pioneering organic henna across Kashmir.',
    links: [
      {
        label: 'Read article',
        href: 'https://www.greaterkashmir.com/todays-paper/engineering-graduate-breaks-stereotypes-with-her-henna-art',
      },
    ],
  },
  {
    number: '02',
    category: 'Video & Reel Spotlight',
    title: 'Rising Kashmir',
    description:
      '“Watch engineering graduate Sumaiya Rashid Magray defies norms with her stunning henna art” — featured across Rising Kashmir video and Instagram reel spotlights.',
    links: [
      {
        label: 'Watch on Facebook',
        href: 'https://www.facebook.com/therisingkashmir/videos/watch-engineering-graduate-sumaiya-rashid-magray-defies-norms-with-her-stunning-/629453583286646/',
      },
      {
        label: 'Watch Instagram Reel',
        href: 'https://www.instagram.com/rising_kashmir/reel/DHiZp67TroI',
      },
    ],
  },
  {
    number: '03',
    category: 'Regional Press Profile',
    title: 'Indus Post',
    description:
      '“Meet Kashmir’s first organic henna artist” — profiling Mehandi by Sana’s small-batch botanical cones and bridal practice.',
    links: [
      {
        label: 'Read profile',
        href: 'https://theinduspost.com/2020/01/25/kashmir/meet-kashmirs-first-organic-henna-artist/',
      },
    ],
  },
  {
    number: '04',
    category: 'Video Documentary',
    title: 'Kashmir Unheard',
    description:
      'Video feature chronicling Sana’s craft, commitment to PPD-free natural henna, and grassroots entrepreneurial journey.',
    links: [
      {
        label: 'Watch feature',
        href: 'https://m.facebook.com/watch/?v=371832803538773&_rdr',
      },
    ],
  },
  {
    number: '05',
    category: 'Podcast Conversation',
    title: 'Karnikazzz Buzzz Podcast',
    description:
      'Long-form podcast guest interview discussing organic henna formulation, building a boutique studio, and entrepreneurial resilience.',
    links: [
      {
        label: 'Apple Podcasts',
        href: 'https://podcasts.apple.com/in/podcast/karnikazzz-buzzz/id1560325608?i=1000565756235',
      },
      {
        label: 'Spotify',
        href: 'https://open.spotify.com/episode/52ouapYYVb9tUfsKW6fCKl?si=paZhCq3HTW2Q2QPiVmNZbw',
      },
    ],
  },
  {
    number: '06',
    category: 'Event Organization & Jury',
    title: 'Organized Maenz 2019 & Competition Jury',
    description:
      'Organized Maenz 2019 — Since then, Sana has judged various henna competitions throughout Kashmir.',
  },
  {
    number: '07',
    category: 'National Representation · Dec 2018',
    title: 'North India National Youth Festival',
    description:
      'Attended the North India National Youth Festival at Panjab University in December 2018, representing Kashmir.',
  },
];

const STUDIO_PILLARS = [
  {
    number: '01',
    title: 'Botanical Purity',
    body: 'Triple-cloth sifted 100% pure Rajasthani henna leaf powder blended with steam-distilled eucalyptus and lavender essential oils—zero PPD, chemical dyes, or synthetic solvents.',
  },
  {
    number: '02',
    title: 'Small-Batch Freshness',
    body: 'Every batch of paste, aftercare balm, and hair blend is mixed fresh at our Srinagar (Baghat Barzullah) and Bangalore studios and hand-rolled into ultra-fine 0.38mm cones for reliable lawsone release.',
  },
  {
    number: '03',
    title: 'Unhurried Craft',
    body: 'From bespoke Kashmiri bridal architecture to intimate festive cuffs, each motif is planned around skin placement, natural stain oxidation, and calm celebration.',
  },
];

export default function AboutPage() {
  const aboutJson = serializeJsonLd(buildAboutPageJsonLd(AWARDS_AND_HONORS));
  const breadcrumbJson = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ])
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: aboutJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      {/* Crisp White Split 5/7 Botanical Study & Story Intro */}
      <section
        aria-labelledby="about-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-10 md:py-18">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber mb-8"
          >
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink font-medium">About</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <figure className="space-y-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[13rem] rounded-b-2xl border border-hairline bg-paper shadow-[0_24px_60px_-20px_rgba(17,17,17,0.14)]">
                  <SanaBurqaAtelierPortrait className="ck-arch-artwork w-full h-full" />
                  <div aria-hidden="true" className="ck-arch-veil" />
                  <div className="pointer-events-none absolute inset-3 rounded-t-[12rem] rounded-b-xl border border-ink/10" />
                </div>
                <figcaption className="text-xs font-semibold uppercase tracking-[0.14em] text-umber text-center">
                  Sumaiya Rashid Magray (Sana) &middot; Srinagar &amp; Bangalore Studios
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
              <TextReveal variant="line" immediate>
                <h1
                  id="about-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1]"
                >
                  From electronics engineering to pioneering organic henna in Kashmir.
                </h1>
              </TextReveal>
              <BotanicalSprig />
              <p className="text-base md:text-lg text-ink leading-relaxed max-w-2xl">
                Founded in Srinagar by Sumaiya Rashid Magray (Sana)—an Electronics &amp; Communication Engineering graduate and Kashmir’s first freelance organic henna artist—Mehandi by Sana now operates from Srinagar and Bangalore, bridging bespoke bridal artistry with a small-batch botanical apothecary.
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
              <span className="text-inverse/75 font-normal">Srinagar &amp; Bangalore</span>
            </figcaption>
          </figure>
        </TextReveal>
      </section>

      <BotanicalDivider />

      {/* Three-Column Pillars Strip */}
      <section
        aria-labelledby="pillars-heading"
        className="editorial-container pt-16 md:pt-20 pb-14 md:pb-16"
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
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ink font-serif text-xs italic text-inverse">
                    {pillar.number}
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-hairline bg-linen text-ink">
                    {pillar.number === '01' ? (
                      <PureBotanicalIcon size={18} />
                    ) : pillar.number === '02' ? (
                      <HennaConeIcon size={18} />
                    ) : (
                      <BridalArchIcon size={18} />
                    )}
                  </span>
                </div>
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
      </section>

      {/* All 7 Verified Awards & Honors */}
      <section
        id="awards-honors"
        aria-labelledby="awards-honors-heading"
        className="editorial-container pt-14 pb-16 md:pb-20 border-t border-hairline"
      >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <VerifiedHonorSealIcon size={15} className="text-terracotta shrink-0" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  07 Honors, Jury &amp; Press Features
                </p>
              </div>
              <TextReveal variant="line">
                <h2
                  id="awards-honors-heading"
                  className="font-serif text-3xl md:text-4xl font-medium text-ink"
                >
                  Awards &amp; Honors
                </h2>
              </TextReveal>
            </div>
            <p className="text-sm text-umber max-w-md leading-relaxed">
              Recognition across newspapers, documentaries, podcasts, competitions, and national youth stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AWARDS_AND_HONORS.map((item, idx) => (
              <TextReveal
                key={item.number}
                variant="fade"
                delayMs={idx * 55}
                className={
                  item.number === '07'
                    ? 'md:col-span-2 lg:col-span-3 flex'
                    : 'flex'
                }
              >
                <article
                  className={`relative overflow-hidden w-full rounded-2xl p-7 flex flex-col justify-between gap-5 transition-colors ${
                    item.number === '07'
                      ? 'bg-ink text-inverse border border-ink shadow-[0_20px_50px_-20px_rgba(17,17,17,0.3)] md:flex-row md:items-stretch'
                      : 'bg-paper text-ink border border-hairline hover:border-ink/40'
                  }`}
                >
                  {item.number === '07' ? (
                    <div
                      aria-hidden="true"
                      className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
                    />
                  ) : null}

                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          item.number === '07'
                            ? 'text-terracotta'
                            : 'text-umber'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-serif text-xs italic shrink-0 ${
                          item.number === '07'
                            ? 'md:hidden bg-terracotta text-inverse'
                            : 'bg-ink text-inverse'
                        }`}
                      >
                        {item.number}
                      </span>
                    </div>

                    <h3
                      className={`font-serif text-xl sm:text-2xl font-medium leading-snug ${
                        item.number === '07' ? 'text-inverse' : 'text-ink'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed ${
                        item.number === '07'
                          ? 'text-inverse/80 max-w-3xl'
                          : 'text-umber'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {item.links && item.links.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-terracotta/45 px-3.5 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta hover:text-inverse transition-colors"
                        >
                          {link.label} &#8599;
                        </a>
                      ))}
                    </div>
                  ) : item.number === '07' ? (
                    <div className="flex items-center justify-between md:flex-col md:items-end md:justify-between md:shrink-0 pt-2 md:pt-0">
                      <span className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-full bg-terracotta text-inverse font-serif text-xs italic shrink-0">
                        {item.number}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                        <VerifiedHonorSealIcon size={14} className="shrink-0" />
                        <span>Verified Studio Honor</span>
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] pt-2 text-umber/80">
                      <VerifiedHonorSealIcon size={14} className="text-terracotta shrink-0" />
                      <span>Verified Studio Honor</span>
                    </div>
                  )}
                </article>
              </TextReveal>
            ))}
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
