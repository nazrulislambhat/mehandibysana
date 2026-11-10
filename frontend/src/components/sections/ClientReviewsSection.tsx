import React from 'react';
import Link from 'next/link';
import { TextReveal } from '@/components/ui/TextReveal';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';

interface ClientReviewEntry {
  number: string;
  category: string;
  quote: string;
  featured?: boolean;
}

const CLIENT_REVIEWS: ClientReviewEntry[] = [
  {
    number: '01',
    category: 'Bridal Mehandi · Home Session',
    featured: true,
    quote:
      'Thank you Sana for taking out time & giving me the best kind of happiness by doing my Mehandi. It was on my bucket list since a long long time & seeing you applying my mehandi gave me all the satisfaction I could have had. Your passion, hardwork, kindness & more importantly your ikhlaq needs no validation. I loved the time I spent with you & I loved having you in my home. Allah bless you with the best of everything & even more.',
  },
  {
    number: '02',
    category: 'Nail Henna',
    quote:
      'Assalamualaikum, I received my nail henna, and applied it on my toe nails yesterday only, Alhumdulillah I’m totally in love with this orangy color of my nails. I’ve always wanted this color since 2012, my nikah year when I for the first time applied nail henna bought by my mother from Saudi, since then I couldn’t find the same, whenever I applied any nail henna it gave that black color and within days turned yellow, which I hate. But your nail henna, the fragrance, the color took me back to my nikah time & Alhumdulillah finally I found what I always wanted in my neighborhood.',
  },
  {
    number: '03',
    category: 'Henna Artistry',
    quote:
      'Beauty MashaAllah, I had to pause & take a breath and admire this flawless work again. What magic Sana you spin, I am always spellbound.',
  },
  {
    number: '04',
    category: 'Organic Henna Cones',
    quote:
      'Lovely stain in just one application. I received the cones on Wednesday almost 3 weeks after you delivered them. They were not in the freezer and I was thinking maybe they might not give a nice stain. But to my surprise I applied it on my blank nails for 2 hrs only. My nails were yellow as I expected, but this morning when I woke up — this is really pretty.',
  },
  {
    number: '05',
    category: 'Nail Henna · Repeat Order',
    quote:
      'I’m so much in love with my nails now that I don’t let it go off. As soon as my nails grow I apply a new coat. Since April last year my nails are all covered in your nail henna.',
  },
  {
    number: '06',
    category: 'Nail Henna · Family Order',
    quote:
      'I just applied two coats and I thought it won’t give a stain. I was wrong. The stain color is consistent and it hasn’t faded since then. My family has already placed an order for more nail cones and my grandma is so obsessed. It actually deserves an appreciation. Thank you so much, Sana!',
  },
];

export function ClientReviewsSection() {
  return (
    <section
      id="client-reviews"
      aria-labelledby="client-reviews-heading"
      className="border-b border-hairline bg-canvas"
    >
      <div className="editorial-container py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-14">
          <div className="max-w-xl">
            <TextReveal variant="fade">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  02 // What Our Clients Say
                </p>
              </div>
            </TextReveal>
            <TextReveal variant="line" delayMs={60}>
              <h2
                id="client-reviews-heading"
                className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight"
              >
                Client reviews
              </h2>
            </TextReveal>
          </div>

          <p className="text-sm md:text-base text-umber leading-relaxed max-w-md">
            Our{' '}
            <strong className="font-semibold text-ink">Henna products</strong>{' '}
            and{' '}
            <strong className="font-semibold text-ink">Services</strong>{' '}
            in their own words — shared directly by brides and repeat studio clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {CLIENT_REVIEWS.map((review, idx) => (
            <TextReveal
              key={review.number}
              variant="fade"
              delayMs={idx * 60}
              className="flex"
            >
              <figure
                className={`relative overflow-hidden w-full rounded-2xl p-7 md:p-8 flex flex-col justify-between gap-6 transition-colors ${
                  review.featured
                    ? 'bg-plaque text-plaque-ink border border-plaque-border shadow-[0_20px_50px_-20px_rgba(17,17,17,0.3)]'
                    : 'bg-paper text-ink border border-hairline hover:border-ink/40'
                }`}
              >
                {review.featured ? (
                  <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta-solid"
                  />
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-serif text-sm font-semibold italic shrink-0 ${
                        review.featured
                          ? 'bg-terracotta-solid text-on-accent'
                          : 'bg-ink text-inverse'
                      }`}
                    >
                      {review.number}
                    </span>
                    <BotanicalSprig
                      className={`w-10 h-3.5 shrink-0 ${
                        review.featured ? 'text-terracotta' : 'opacity-70'
                      }`}
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className={`block font-serif text-3xl leading-none mb-2 ${
                      review.featured ? 'text-terracotta' : 'text-terracotta/85'
                    }`}
                  >
                    &ldquo;
                  </span>

                  <blockquote
                    className={`leading-relaxed ${
                      review.featured
                        ? 'text-sm md:text-[15px] text-plaque-ink/90'
                        : 'text-sm text-ink/90'
                    }`}
                  >
                    {review.quote}
                  </blockquote>
                </div>

                <figcaption
                  className={`pt-4 border-t flex items-center justify-between gap-2 text-xs ${
                    review.featured
                      ? 'border-plaque-ink/15 text-plaque-ink/75'
                      : 'border-hairline text-umber'
                  }`}
                >
                  <span
                    className={`font-semibold uppercase tracking-[0.12em] ${
                      review.featured ? 'text-terracotta' : 'text-ink'
                    }`}
                  >
                    {review.category}
                  </span>
                  <span className="shrink-0 font-serif italic">
                    Client Note
                  </span>
                </figcaption>
              </figure>
            </TextReveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 text-xs sm:text-sm text-umber">
          <span>All messages transcribed verbatim from real client notes on mehandibysana.com</span>
          <Link
            href="/shop"
            className="font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1"
          >
            Explore Nail Henna &amp; Organic Cones &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

