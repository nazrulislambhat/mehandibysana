import React from 'react';
import Image from 'next/image';
import { TextReveal } from '@/components/ui/TextReveal';
import { LineDotRightHorizontal, Camera } from 'lucide-react';

export interface InstagramPost {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
    alt: 'Bridal arms and palm mandala organic henna artistry by @mehandibysana',
    caption: 'Bridal arms & palm mandala with 0.38mm organic cones',
  },
  {
    id: 'ig-2',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
    alt: 'Kashmiri Chinar leaf silhouette motif by @mehandibysana',
    caption: 'Dal Lake Chinar leaf palm composition',
  },
  {
    id: 'ig-3',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
    alt: 'Fine lotus and lattice henna work by @mehandibysana',
    caption: 'Lotus blossoms & fine jali latticework',
  },
  {
    id: 'ig-4',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg',
    alt: 'Royal Mughal archways and architecture henna by @mehandibysana',
    caption: 'Mughal archway detailing & natural oxidation',
  },
  {
    id: 'ig-5',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
    alt: 'Minimalist contemporary hathphool cuff by @mehandibysana',
    caption: 'Minimalist jewelry-inspired hathphool cuff',
  },
  {
    id: 'ig-6',
    src: 'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg',
    alt: 'Deep mahogany 48-hour stain progression study by @mehandibysana',
    caption: '48-hour deep mahogany natural henna stain results',
  },
  {
    id: 'ig-7',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-7.jpg',
    alt: 'Intricate bridal palm symmetry and floral bands by @mehandibysana',
    caption: 'Symmetrical bridal cuff & floral vine bands',
  },
  {
    id: 'ig-8',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-4.jpg',
    alt: 'Traditional Kashmiri floral medallion design by @mehandibysana',
    caption: 'Centerpiece floral sunburst medallion',
  },
  {
    id: 'ig-9',
    src: 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-1.jpg',
    alt: 'Artisanal bridal feet and anklet motif by @mehandibysana',
    caption: 'Bridal feet & anklet mandala detailing',
  },
];

export interface InstagramFeedSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function InstagramFeedSection({
  className = '',
  title = 'Artistry in motion & fresh studio dispatches.',
  subtitle = 'Follow our daily bridal sessions, stain progression reveals, and fresh small-batch Sojat henna preparation across Kashmir & Bengaluru.',
}: InstagramFeedSectionProps) {
  const profileUrl = 'https://www.instagram.com/mehandibysana';
  const username = 'mehandibysana';

  return (
    <section
      aria-labelledby="instagram-feed-heading"
      className={`border-b border-hairline bg-canvas ${className}`}
    >
      <div className="editorial-container py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <div className="max-w-2xl">
            <TextReveal variant="fade">
              <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3.5 py-1.5 mb-3.5">
                <Camera className="w-3 h-3 text-brand-green shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-green">
                  Instagram Journal &middot; @{username}
                </p>
              </div>
            </TextReveal>

            <TextReveal variant="line" delayMs={60}>
              <h2
                id="instagram-feed-heading"
                className="font-serif text-3xl sm:text-4xl font-medium text-ink leading-tight mb-3"
              >
                {title}
              </h2>
            </TextReveal>

            <p className="text-sm md:text-base text-umber leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="shrink-0 self-start md:self-auto">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow @${username} on Instagram`}
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-sm font-semibold tracking-wide text-inverse hover:bg-brand-green transition-colors shadow-sm"
            >
              <span>Follow @{username}</span>
              <Camera className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* 9-Image Instagram Grid (3x3 on mobile & tablet, 9 across on desktop) */}
        <div className="grid grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-3 rounded-2xl overflow-hidden p-2 sm:p-2.5 bg-paper border border-hairline shadow-xs">
          {INSTAGRAM_POSTS.map((post, idx) => (
            <a
              key={post.id}
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square w-full overflow-hidden rounded-xl bg-linen border border-hairline/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-focus"
              aria-label={`View Instagram post ${idx + 1} by @${username}: ${post.caption || post.alt}`}
            >
              <Image
                src={post.src}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 11vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />

              {/* Hover Scrim with Instagram Glyph */}
              <div className="pointer-events-none absolute inset-0 bg-[#181818]/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                <span className="w-8 h-8 rounded-full bg-paper/20 backdrop-blur-sm border border-paper/40 flex items-center justify-center text-[#ffffff] mb-1.5 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Camera className="w-3 h-3" />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#DBCAB6] line-clamp-1">
                  View Post
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Link Strip */}
        <div className="mt-5 pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs text-umber">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-brand-green shrink-0 animate-pulse"
            />
            <span>Active daily updates on Instagram &middot; Kashmir &amp; Bengaluru</span>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-green hover:text-brand-green-hover underline underline-offset-4 decoration-brand-green/40 hover:decoration-brand-green font-medium transition-colors"
          >
            <span>instagram.com/{username}</span>
            <LineDotRightHorizontal className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
