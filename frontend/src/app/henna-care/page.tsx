import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  buildHennaCareHowToJsonLd,
  serializeJsonLd,
} from '@/lib/structured-data';
import {
  PolicyDocumentLayout,
  type PolicyTocItem,
} from '@/components/editorial/PolicyDocumentLayout';
import { StainProgressionGuide } from '@/components/shop/StainProgressionGuide';
import { LinkButton } from '@/components/ui/Button';
import {
  FreezerStorageIcon,
  HennaConeIcon,
  PureBotanicalIcon,
} from '@/components/graphics/BrandIcons';

export const metadata: Metadata = buildPageMetadata({
  title: 'Henna Storage, Application & 48-Hour Stain Care Guide',
  description:
    'Learn how to freeze fresh organic henna cones (-18°C), thaw gently without condensation, seal bridal mehandi for dark mahogany stain, and mix Sojat hair henna.',
  canonicalPath: '/henna-care',
  keywords: [
    'how to store organic henna cones',
    'henna aftercare 48 hour stain',
    'freeze fresh mehandi cones',
    'natural henna stain progression',
    'hair henna mixing guide',
  ],
});

const TOC: PolicyTocItem[] = [
  {
    id: 'freezer-storage',
    number: '01',
    title: 'Freezer Storage Within 48 Hours',
  },
  {
    id: 'thawing-ritual',
    number: '02',
    title: 'Thawing & Pin-Tip Preparation',
  },
  {
    id: 'skin-prep',
    number: '03',
    title: 'Before Application: Clean Skin Prep',
  },
  {
    id: 'aftercare-seal',
    number: '04',
    title: 'Drying, Sealing & Balm Aftercare',
  },
  { id: 'winter-tips', number: '05', title: 'Winter & Kashmir Climate Tips' },
  { id: 'hair-henna', number: '06', title: 'Organic Hair Henna Mixing Ritual' },
];

export default function HennaCarePage() {
  const howToJson = serializeJsonLd(buildHennaCareHowToJsonLd());

  return (
    <PolicyDocumentLayout
      eyebrow="Botanical Ritual & Care"
      title="Henna Storage & 48-Hour Stain Care"
      subtitle="Because 100% pure organic henna contains zero synthetic chemical dyes, proper freezer storage, skin prep, and water-free aftercare unlock dramatic espresso-mahogany color."
      effectiveDate="Artist Reference Guide"
      documentCode="MBS-CARE-01"
      activeSlug="care"
      toc={TOC}
      beforeContent={
        <div className="border-b border-hairline">
          <StainProgressionGuide />
        </div>
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: howToJson }}
      />
      <section
        id="freezer-storage"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="inline-flex items-center gap-1.5 font-serif text-xs italic text-terracotta">
          <FreezerStorageIcon size={14} className="shrink-0" />
          <span>Step 01</span>
        </p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Deep Freeze Unused Cones Immediately (-18&deg;C)
        </h2>
        <p className="text-umber">
          Fresh Sojat henna paste is a living botanical blend with no
          preservatives. Once your parcel reaches you, place any cones you are
          not using within the next 48 hours inside a sealed zip-lock bag or
          airtight container and store flat in your{' '}
          <strong>deep freezer (-18&deg;C or colder)</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Freezer Shelf Life:</strong> Properly sealed frozen cones
            maintain peak dye potency for <strong>3 to 4 months</strong>.
          </li>
          <li>
            <strong>Avoid Regular Fridge Shelf:</strong> Standard refrigerator
            cooling (4&deg;C) still permits slow oxidation and dulls lawsone
            staining within ~5 days—always use the freezer for storage beyond
            two days.
          </li>
        </ul>
      </section>

      <section
        id="thawing-ritual"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="inline-flex items-center gap-1.5 font-serif text-xs italic text-terracotta">
          <HennaConeIcon size={14} className="shrink-0" />
          <span>Step 02</span>
        </p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Thawing Gently &amp; Using the 0.38mm Precision Pin
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-umber">
          <li>
            Remove only the number of cones needed for your session and rest
            them at <strong>room temperature for 15–20 minutes</strong> before
            pulling the tip pin.
          </li>
          <li>
            <strong>Never microwave or soak frozen cones in hot water</strong>
            —excess heat breaks essential oils and prematurely flashes the dye
            molecules.
          </li>
          <li>
            Gently roll the thawed cone between your palms for 30 seconds to
            restore silky paste flow.
          </li>
          <li>
            Re-insert the tip pin during breaks and re-freeze leftovers promptly
            with minimal repeated freeze–thaw cycles.
          </li>
        </ol>
      </section>

      <section
        id="skin-prep"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Step 03</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Clean Bare Skin: Pre-Application Prep
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            Wash hands and forearms thoroughly with plain soap and water, pat
            completely dry, and apply{' '}
            <strong>
              zero moisturizer, hand cream, sunscreen, or perfume oils
            </strong>{' '}
            before mehandi—lotion forms an occlusive film that blocks lawsone
            binding.
          </li>
          <li>
            Complete waxing, manicures, or exfoliation scrubs at least{' '}
            <strong>24–48 hours prior</strong> so dead skin turnover
            doesn&rsquo;t shed fresh stain prematurely.
          </li>
        </ul>
      </section>

      <section
        id="aftercare-seal"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Step 04</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Sealing, Removing Dried Paste &amp; 48-Hour Balm Aftercare
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Leave Paste On 4–6+ Hours:</strong> For deep bridal
            richness, allow the design to dry gently and remain bonded on the
            skin for at least 4–6 hours (or overnight wrapped in medical
            tape/cotton gloves).
          </li>
          <li>
            <strong>Dab Sealant Lightly:</strong> Once touch-dry, lightly dab a
            classic lemon-sugar cotton ball or Sana&rsquo;s Natural Sealant
            Spray so crispy lines do not crack and fall off too soon.
          </li>
          <li>
            <strong>Scrape Dry—Never Wash With Water:</strong> When ready, rub
            palms with <strong>Sana&rsquo;s Stain Darkening Balm</strong>,
            mustard oil, or coconut oil and gently brush off dried henna crumbs
            with your fingers or butter knife.
          </li>
          <li>
            <strong>Protect for First 12–24 Hours:</strong> Avoid direct water,
            dishwashing liquid, soap, and alcohol sanitizers for as long as
            possible while your stain oxidizes from saffron-orange into deep
            bridal mahogany.
          </li>
        </ol>
      </section>

      <section
        id="winter-tips"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Step 05</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Kashmir &amp; Winter Oxidation Tips
        </h2>
        <p className="text-umber">
          Body heat significantly accelerates lawsone keratin bonding. In chilly
          Srinagar winters or air-conditioned venues, warm hands gently near
          cloves toasted in a dry skillet (bhaap / clove steam for 1–2 minutes
          carefully above heat) and keep covered beneath warm woollen mittens
          after balm application.
        </p>
      </section>

      <section
        id="hair-henna"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="inline-flex items-center gap-1.5 font-serif text-xs italic text-terracotta">
          <PureBotanicalIcon size={14} className="shrink-0" />
          <span>Step 06</span>
        </p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Organic Triple-Sifted Hair Henna Preparation
        </h2>
        <p className="text-umber">
          Mix Mehandi by Sana pure Sojat Hair Henna Powder with brewed black
          tea, hibiscus, or warm chamomile decoction (plus 1 tsp alma or
          fenugreek if desired) in a clean{' '}
          <Link
            href="/shop?category=mehandi-tools-supplies"
            className="text-terracotta underline underline-offset-4"
          >
            glass mixing bowl
          </Link>
          . Cover and rest 6–8 hours overnight for slow dye release before
          combing smoothly through clean, product-free hair for 2–3 hours under
          a shower cap.
        </p>
        <div className="pt-3 flex flex-wrap gap-3">
          <LinkButton
            href="/shop?category=henna-care-essential-oils"
            variant="primary"
            size="md"
            className="rounded-md"
          >
            Shop Aftercare Oils &amp; Balms
          </LinkButton>
          <LinkButton
            href="/shop?category=organic-henna"
            variant="secondary"
            size="md"
            className="rounded-md"
          >
            Browse Fresh Cones
          </LinkButton>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}
