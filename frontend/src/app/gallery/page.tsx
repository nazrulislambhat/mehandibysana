import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata, toAbsoluteUrl } from '@/lib/seo';
import {
  buildBreadcrumbJsonLd,
  buildGalleryJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import { LinkButton } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';

interface GalleryPlate {
  id: string;
  number: string;
  category: string;
  title: string;
  caption: string;
  imageSrc: string;
  imageAlt: string;
  aspectClass: string;
  spanClass: string;
}

const GALLERY_PLATES: GalleryPlate[] = [
  {
    id: 'plate-01',
    number: 'Plate 01',
    category: 'Bridal Henna',
    title: 'Full Bridal Arms & Soles Mandala',
    caption:
      'Symmetrical bridal henna featuring traditional peacock motifs, floral vines, and personalized bride & groom initials hand-drawn with 0.38mm organic cones.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
    imageAlt:
      'Full bridal arms and soles mandala henna featuring peacock motifs and floral vines by Mehandi by Sana',
    aspectClass: 'aspect-[4/5]',
    spanClass: 'lg:col-span-7',
  },
  {
    id: 'plate-02',
    number: 'Plate 02',
    category: 'Festive & Kashmiri Motif',
    title: 'Kashmiri Chinar Leaf Silhouette',
    caption:
      'Inspired by the Chinar trees along Dal Lake in Srinagar, woven into a balanced floral palm composition.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
    imageAlt:
      'Kashmiri Chinar leaf silhouette mehndi woven into a floral palm design by Mehandi by Sana',
    aspectClass: 'aspect-square',
    spanClass: 'lg:col-span-5 lg:mt-14',
  },
  {
    id: 'plate-03',
    number: 'Plate 03',
    category: 'Engagement',
    title: 'Botanical Lotus & Grid Work',
    caption:
      'Fine jali latticework framed by floating lotus blossoms and delicate shading techniques.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
    imageAlt:
      'Botanical lotus and fine jali grid mehndi work on hands for engagement by Mehandi by Sana',
    aspectClass: 'aspect-square',
    spanClass: 'lg:col-span-5',
  },
  {
    id: 'plate-04',
    number: 'Plate 04',
    category: 'Bridal Architecture',
    title: 'Royal Mughal Archways',
    caption:
      'Architectural arches and domes echoing Shalimar Bagh gardens, maturing into a deep 48-hour natural mahogany stain.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg',
    imageAlt:
      'Royal Mughal archways bridal mehndi design on forearms and palms by Mehandi by Sana',
    aspectClass: 'aspect-[4/5]',
    spanClass: 'lg:col-span-7 lg:mt-10',
  },
  {
    id: 'plate-05',
    number: 'Plate 05',
    category: 'Contemporary Fusion',
    title: 'Minimalist Hathphool Cuff',
    caption:
      'Jewelry-style henna draping from the wrists across the knuckles with airy negative-space detailing.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
    imageAlt:
      'Minimalist hathphool cuff contemporary henna design with negative space by Mehandi by Sana',
    aspectClass: 'aspect-[4/5]',
    spanClass: 'lg:col-span-6',
  },
  {
    id: 'plate-06',
    number: 'Plate 06',
    category: 'Stain Progression',
    title: 'Eid Sunburst Medallion',
    caption:
      'Centerpiece sunburst medallion with crisp finger caps showing rich natural oxidation without chemical dyes.',
    imageSrc:
      'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg',
    imageAlt:
      'Eid sunburst medallion organic henna palm stain with dark mahogany oxidation by Mehandi by Sana',
    aspectClass: 'aspect-[4/5]',
    spanClass: 'lg:col-span-6 lg:mt-12',
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: 'Bridal Mehndi Portfolio & Botanical Stain Gallery',
  description:
    'Selected bridal henna designs, Kashmiri Chinar leaf motifs, Royal Mughal archways, and 48-hour natural mahogany stain studies by Sumaiya Rashid Magray (Sana).',
  canonicalPath: '/gallery',
  keywords: [
    'Kashmiri bridal mehndi designs',
    'Chinar mehndi motif',
    'organic henna stain gallery',
    'Sumaiya Rashid Magray portfolio',
    'Mehandi by Sana gallery',
  ],
  images: [
    {
      url: toAbsoluteUrl(GALLERY_PLATES[0].imageSrc),
      alt: GALLERY_PLATES[0].imageAlt,
    },
  ],
});

export default function GalleryPage() {
  const galleryJson = serializeJsonLd(buildGalleryJsonLd(GALLERY_PLATES));
  const breadcrumbJson = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Gallery', path: '/gallery' },
    ])
  );

  return (
    <div className="bg-canvas pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: galleryJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />

      {/* Crisp White Asymmetric Archive Masthead */}
      <section
        aria-labelledby="gallery-page-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-10 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-paper px-4 py-1.5 text-xs text-umber mb-6"
          >
            <Link href="/" className="hover:text-terracotta">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink font-medium">Gallery</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3">
                <span
                  aria-hidden="true"
                  className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                  03 &middot; Archive &amp; Portfolio
                </p>
              </div>
              <TextReveal variant="line" immediate>
                <h1
                  id="gallery-page-heading"
                  className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-[1.1] mb-4"
                >
                  Selected Artistry &amp; Botanical Studies
                </h1>
              </TextReveal>
              <p className="text-sm md:text-base text-umber leading-relaxed max-w-2xl">
                A curated archive of Sana’s hand-drawn organic henna commissions across Srinagar, Jammu &amp; Kashmir, and destination celebrations—created exclusively with freshly rolled, PPD-free botanical cones.
              </p>
            </div>

            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse px-6 py-5 min-w-[250px]">
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
                />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">
                  Exhibition Folio
                </p>
                <p className="font-serif text-2xl font-medium text-inverse">
                  6 Studio Plates
                </p>
                <p className="text-xs text-inverse/70 mt-1">
                  Srinagar &middot; 0% PPD Organic Stain
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="gallery-plates-heading"
        className="editorial-container py-16 md:py-24"
      >
        <h2 id="gallery-plates-heading" className="sr-only">
          Curated Studio Henna Plates
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {GALLERY_PLATES.map((plate, idx) => (
            <TextReveal
              key={plate.id}
              variant="fade"
              delayMs={(idx % 2) * 90}
              className={plate.spanClass}
            >
              <figure className="group space-y-4">
                <div
                  className={`relative ${plate.aspectClass} w-full overflow-hidden rounded-2xl border border-hairline bg-linen`}
                >
                  <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-ink/90 backdrop-blur-sm border border-inverse/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-inverse">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    {plate.number}
                  </span>
                  <Image
                    src={plate.imageSrc}
                    alt={plate.imageAlt}
                    fill
                    priority={idx < 2}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <figcaption className="space-y-1.5 max-w-xl px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                    {plate.category}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-ink leading-snug">
                    {plate.title}
                  </h3>
                  <p className="text-sm text-umber leading-relaxed">
                    {plate.caption}
                  </p>
                </figcaption>
              </figure>
            </TextReveal>
          ))}
        </div>

        {/* Ink Black Bespoke Commission Banner */}
        <div className="relative overflow-hidden mt-20 rounded-2xl bg-ink text-inverse px-6 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-[0_24px_60px_-20px_rgba(17,17,17,0.32)]">
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
          />
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta mb-2">
              Commissions
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-inverse mb-2.5">
              Inquire about a bespoke design
            </h2>
            <p className="text-sm text-inverse/75 leading-relaxed">
              Share your celebration date, venue location, and motif inspirations—Sana tailors each bridal or festive layout to your preferences and prepares fresh cones specifically for your session.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <LinkButton
              href="/contact"
              variant="accent"
              size="md"
              className="rounded-full"
            >
              Request a Booking &rarr;
            </LinkButton>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[44px] rounded-full border border-inverse/30 bg-transparent px-6 py-2.5 text-sm font-medium text-inverse hover:border-inverse hover:bg-inverse/10 transition-colors"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
