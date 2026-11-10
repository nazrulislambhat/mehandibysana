import React from 'react';
import Link from 'next/link';
import { fetchHomepageCatalogSummary } from '@/lib/wc-catalog';
import { Hero } from '@/components/sections/Hero';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';
import { StainProgressionGuide } from '@/components/shop/StainProgressionGuide';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { GalleryPreviewSection } from '@/components/sections/GalleryPreviewSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { LinkButton } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import {
  BotanicalCraftIllustration,
  BotanicalDivider,
  BotanicalSprig,
} from '@/components/graphics/BotanicalIllustrations';

export const revalidate = 3600;

export default async function HomePage() {
  const catalog = await fetchHomepageCatalogSummary();
  const spotlightProduct = catalog.featuredProducts[0] ?? null;

  return (
    <>
      <Hero
        totalProducts={catalog.totalProducts}
        ordersCount={catalog.ordersCount}
        isConfigured={catalog.isConfigured}
      />

      {/* Featured Products — Atelier Curated Shelf */}
      <section
        aria-labelledby="featured-products-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <TextReveal variant="fade">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                    Apothecary &amp; Goods
                  </p>
                </div>
              </TextReveal>
              <TextReveal variant="line" delayMs={60}>
                <h2
                  id="featured-products-heading"
                  className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight"
                >
                  Featured Botanical Products
                </h2>
              </TextReveal>
              <p className="text-sm md:text-base text-umber leading-relaxed mt-2 max-w-xl">
                Triple-sifted organic Sojat henna cones, aftercare balms, botanical oils, and studio preparation tools handcrafted in Srinagar.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-canvas px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink hover:border-terracotta hover:text-terracotta self-start md:self-auto transition-colors"
            >
              <span>Browse All {catalog.totalProducts ?? 19} Products</span>
              <span aria-hidden="true" className="text-terracotta">&rarr;</span>
            </Link>
          </div>

          {spotlightProduct ? (
            <FeaturedProductsSection
              featuredProducts={catalog.featuredProducts}
              allProducts={catalog.allProducts ?? catalog.featuredProducts}
            />
          ) : !catalog.isConfigured ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-5 flex">
                <div className="w-full rounded-2xl border border-hairline bg-paper p-8 flex flex-col justify-between">
                  <div>
                    <BotanicalSprig className="mb-4" />
                    <h3 className="font-serif text-2xl font-medium text-ink mb-2">
                      Live Catalog Connection
                    </h3>
                    <p className="text-sm text-umber leading-relaxed">
                      Products, live stock counts, and prices populate directly from your MedusaJS backend once configured.
                    </p>
                  </div>
                  <div className="mt-6">
                    <LinkButton
                      href="/shop"
                      variant="secondary"
                      size="md"
                      className="rounded-full"
                    >
                      Open Shop Page
                    </LinkButton>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-hairline bg-paper p-7 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-umber mb-2">
                      Collection 01
                    </p>
                    <h3 className="font-serif text-2xl text-ink mb-2">
                      Fresh Henna Cones
                    </h3>
                    <p className="text-sm text-umber leading-relaxed">
                      Hand-rolled 0.38mm fine-tip cones mixed with triple-sifted organic henna leaf powder, lemon hydrosol, and pure essential oils.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex items-center min-h-[36px] text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1"
                  >
                    View cones &rarr;
                  </Link>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-7 flex flex-col justify-between sm:mt-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-umber mb-2">
                      Collection 02
                    </p>
                    <h3 className="font-serif text-2xl text-ink mb-2">
                      Aftercare &amp; Botanical Kits
                    </h3>
                    <p className="text-sm text-umber leading-relaxed">
                      Steam-distilled eucalyptus oil, nourishing aftercare balms, chemical-free hair henna powder, and complete DIY starter kits.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex items-center min-h-[36px] text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1"
                  >
                    View kits &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : catalog.error ? (
            <FeedbackState
              tone="error"
              title="Unable to reach studio store right now"
              description={`Catalog items could not be loaded (${catalog.error}). Please verify that your MedusaJS API is reachable.`}
              action={{ label: 'Try Shop Page', href: '/shop' }}
            />
          ) : (
            <FeedbackState
              title="No featured products published yet"
              description="Publish products in your MedusaJS catalog to feature them here."
              action={{ label: 'View Shop', href: '/shop' }}
            />
          )}
        </div>
      </section>

      <ServicesSection />

      <StainProgressionGuide />

      {/* Split Editorial About Section with Botanical Craft Graphic */}
      <section
        aria-labelledby="about-heading"
        className="border-b border-hairline bg-canvas"
      >
        <div className="editorial-container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <TextReveal variant="fade" className="lg:col-span-5">
              <div className="rounded-2xl border border-hairline bg-paper p-8 md:p-10 flex flex-col items-center text-center shadow-xs">
                <BotanicalCraftIllustration className="w-full max-w-[280px] h-auto mb-3" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-umber">
                  Botanical Preparation
                </p>
              </div>
            </TextReveal>

            <div className="lg:col-span-7 space-y-5 max-w-2xl">
              <TextReveal variant="fade">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rotate-45 bg-terracotta shrink-0"
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                    About the Studio
                  </p>
                </div>
              </TextReveal>
              <TextReveal variant="line" delayMs={60}>
                <h2
                  id="about-heading"
                  className="font-serif text-3xl md:text-4xl font-medium text-ink leading-tight"
                >
                  Small-batch preparation &amp; unhurried craft.
                </h2>
              </TextReveal>
              <TextReveal variant="fade" delayMs={120}>
                <p className="text-base md:text-lg text-ink leading-relaxed">
                  Holding a degree in Electronics &amp; Communication Engineering, Sumaiya Rashid Magray (Sana) founded Kashmir’s first freelance organic henna studio in Baghat Barzullah, Srinagar—replacing harsh chemical cones with pure, skin-safe botanicals.
                </p>
              </TextReveal>
              <TextReveal variant="fade" delayMs={180}>
                <p className="text-sm md:text-base text-umber leading-relaxed">
                  Every batch of paste is triple-cloth sifted and blended fresh with high-terpene eucalyptus and lavender oils for crisp bridal detailing and a deep, natural mahogany stain.
                </p>
              </TextReveal>
              <TextReveal variant="fade" delayMs={220}>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center min-h-[36px] text-sm font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 py-1.5"
                  >
                    Read the full story &rarr;
                  </Link>
                </div>
              </TextReveal>
            </div>
          </div>
        </div>
      </section>

      <GalleryPreviewSection />

      <TestimonialsSection reviews={catalog.reviews} />

      <div className="pt-8 bg-canvas">
        <BotanicalDivider />
      </div>

      {/* Contact / Booking Signature Ink Black Framed Invitation */}
      <section aria-labelledby="booking-cta-heading" className="bg-canvas">
        <div className="editorial-container py-16 md:py-24">
          <TextReveal variant="fade">
            <div className="relative overflow-hidden rounded-2xl bg-ink text-inverse px-6 py-14 md:px-14 md:py-20 text-center max-w-4xl mx-auto shadow-[0_24px_60px_-20px_rgba(17,17,17,0.32)]">
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-terracotta"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta mb-3">
                Bookings &amp; Orders
              </p>
              <h2
                id="booking-cta-heading"
                className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-inverse leading-tight mb-5"
              >
                Planning a celebration or bespoke order?
              </h2>
              <p className="text-base text-inverse/75 leading-relaxed max-w-xl mx-auto mb-8">
                Bridal and celebration dates are reserved in advance across Srinagar, Jammu &amp; Kashmir, and destination venues. Custom bulk cone orders are freshly mixed and dispatched within 2 business days.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <LinkButton
                  href="/contact"
                  variant="accent"
                  size="lg"
                  className="rounded-full"
                >
                  Request a Booking &rarr;
                </LinkButton>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center min-h-[48px] rounded-full border border-inverse/30 bg-transparent px-7 py-3 text-base font-medium text-inverse hover:border-inverse hover:bg-inverse/10 transition-colors"
                >
                  Shop Products
                </Link>
              </div>
            </div>
          </TextReveal>
        </div>
      </section>
    </>
  );
}
