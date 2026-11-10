import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextReveal } from '@/components/ui/TextReveal';

interface SelectedWorkPlate {
  id: string;
  plate: string;
  tag: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
  aspectClass: string;
  colClass: string;
}

const FEATURED_PLATES: SelectedWorkPlate[] = [
  {
    id: 'plate-01',
    plate: 'Plate 01',
    tag: 'Bridal Henna',
    title: 'Full Bridal Arms & Soles Mandala',
    caption:
      'Symmetrical bridal mandala with traditional peacock motifs, floral vines, and personalized initials.',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
    alt: 'Full bridal arms and soles mandala henna featuring peacock motifs and floral vines by Mehandi by Sana',
    aspectClass: 'aspect-[4/5]',
    colClass: 'lg:col-span-6',
  },
  {
    id: 'plate-02',
    plate: 'Plate 02',
    tag: 'Kashmiri Motif',
    title: 'Chinar Leaf Silhouette Study',
    caption:
      'Kashmiri Chinar leaf silhouette inspired by Dal Lake in fine 0.38mm cone linework.',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
    alt: 'Kashmiri Chinar leaf silhouette mehndi woven into a modern floral palm design',
    aspectClass: 'aspect-square',
    colClass: 'lg:col-span-3',
  },
  {
    id: 'plate-03',
    plate: 'Plate 03',
    tag: 'Stain Progression',
    title: 'Eid Sunburst Medallion',
    caption:
      'Rich 48-hour natural mahogany oxidation from freshly rolled organic Sojat henna paste.',
    src: 'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg',
    alt: 'Deep natural mahogany stain oxidation on palm mandala from fresh organic henna paste',
    aspectClass: 'aspect-[4/5]',
    colClass: 'lg:col-span-3 lg:mt-10',
  },
  {
    id: 'plate-04',
    plate: 'Plate 04',
    tag: 'Engagement Lattice',
    title: 'Botanical Lotus & Jali Grid',
    caption:
      'Delicate jali latticework framed by floating lotus blossoms and soft botanical shading.',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
    alt: 'Botanical lotus and fine jali grid mehndi work on hands for engagement',
    aspectClass: 'aspect-[4/5]',
    colClass: 'lg:col-span-4',
  },
  {
    id: 'plate-05',
    plate: 'Plate 05',
    tag: 'Mughal Architecture',
    title: 'Royal Shalimar Archways',
    caption:
      'Architectural arches and domes echoing Shalimar Bagh gardens across palms and forearms.',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg',
    alt: 'Royal Mughal archways bridal mehndi design on forearms and palms',
    aspectClass: 'aspect-[4/5]',
    colClass: 'lg:col-span-4 lg:mt-8',
  },
  {
    id: 'plate-06',
    plate: 'Plate 06',
    tag: 'Contemporary Fusion',
    title: 'Minimalist Hathphool Cuff',
    caption:
      'Jewelry-inspired henna draping from the wrists across the knuckles with airy negative space.',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
    alt: 'Minimalist hathphool cuff contemporary henna design with negative space',
    aspectClass: 'aspect-[4/5]',
    colClass: 'lg:col-span-4',
  },
];

export function GalleryPreviewSection() {
  return (
    <section
      aria-labelledby="gallery-heading"
      className="border-b border-hairline bg-canvas"
    >
      <div className="editorial-container py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-14">
          <div>
            <TextReveal variant="fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta mb-3">
                Portfolio
              </p>
            </TextReveal>
            <TextReveal variant="line" delayMs={60}>
              <h2
                id="gallery-heading"
                className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight"
              >
                Selected Work &amp; Botanical Studies
              </h2>
            </TextReveal>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center min-h-[36px] text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 self-start md:self-auto py-1.5"
          >
            Explore full gallery &rarr;
          </Link>
        </div>

        {/* Two-tier asymmetric exhibition grid: 6 curated studio plates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          {FEATURED_PLATES.map((item, idx) => (
            <TextReveal
              key={item.id}
              variant="fade"
              delayMs={(idx % 3) * 80}
              className={item.colClass}
            >
              <figure className="group flex flex-col gap-3">
                <div
                  className={`relative ${item.aspectClass} w-full overflow-hidden rounded-xl border border-hairline bg-linen`}
                >
                  <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-ink/90 backdrop-blur-sm border border-inverse/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-inverse">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    {item.plate}
                  </span>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes={
                      idx === 0
                        ? '(max-width: 1024px) 100vw, 48vw'
                        : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw'
                    }
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta">
                    {item.plate} &middot; {item.tag}
                  </p>
                  <h3 className="font-serif text-lg font-medium text-ink leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-umber leading-relaxed">
                    {item.caption}
                  </p>
                </figcaption>
              </figure>
            </TextReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
