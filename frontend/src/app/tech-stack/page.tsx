import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  Server,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Cloud,
  CreditCard,
  Send,
  Search,
  FileCode2,
  CheckCircle2,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { BotanicalSprig } from '@/components/graphics/BotanicalIllustrations';
import { BrandCrest } from '@/components/graphics/BrandMarks';
import { LinkButton } from '@/components/ui/Button';
import { CircleArrowUpRightExit } from '@/components/ui/icons';

export const metadata: Metadata = buildPageMetadata({
  title: 'Technology Stack & Engineering Architecture',
  description:
    'An open breakdown of the headless technology stack powering Mehandi By Sana: Next.js 16, MedusaJS v2, PostgreSQL, Redis, Cloudflare R2, and Razorpay.',
  canonicalPath: '/tech-stack',
  keywords: [
    'Mehandi By Sana tech stack',
    'Next.js 16 headless ecommerce',
    'MedusaJS v2 architecture',
    'PostgreSQL Redis Cloudflare R2',
  ],
});

interface StackLayer {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  technologies: Array<{
    name: string;
    version?: string;
    role: string;
    highlights: string[];
    link?: string;
  }>;
}

const STACK_LAYERS: StackLayer[] = [
  {
    category: '1. Storefront & Client Architecture',
    icon: Layers,
    description:
      'High-performance, edge-rendered user interface designed for mobile-first organic henna shopping with sub-100ms transitions.',
    technologies: [
      {
        name: 'Next.js',
        version: '16.4 (App Router & Turbopack)',
        role: 'Full-stack storefront framework & edge rendering engine',
        highlights: [
          'Incremental Static Regeneration (ISR) with 60s catalog revalidation',
          'Fast Turbopack development & optimized production builds',
          'Edge API route proxies for token security and publishable key protection',
          'Native Server Components for sub-80ms First Contentful Paint',
        ],
        link: 'https://nextjs.org',
      },
      {
        name: 'React',
        version: '19.3',
        role: 'Declarative component rendering & Concurrent features',
        highlights: [
          'Zero client-side waterfall data fetching',
          'Optimistic UI state updates on bag additions and coupon calculations',
        ],
        link: 'https://react.dev',
      },
      {
        name: 'Tailwind CSS',
        version: 'v4.0 (CSS-first engine)',
        role: 'Editorial design system & artisanal color token runtime',
        highlights: [
          'Native @theme inline CSS custom properties for instant light/dark theme switching',
          'Fluid typography, burnt-terracotta branding, and editorial serif hierarchy',
          'Zero JavaScript CSS bundle overhead (<15KB critical stylesheet)',
        ],
        link: 'https://tailwindcss.com',
      },
      {
        name: 'Zustand',
        version: 'v5.1',
        role: 'Client-side shopping bag state & session persistence',
        highlights: [
          'Lightweight state machine (<1KB) managing bag mutations',
          'Cross-tab synchronization via localStorage persistence',
          'Debounced line-item quantity controls and custom order note binding',
        ],
        link: 'https://github.com/pmndrs/zustand',
      },
    ],
  },
  {
    category: '2. Commerce Engine & Core Backend',
    icon: Cpu,
    description:
      'Scalable, modular headless commerce engine managing product catalogs, dual-studio logistics, and automated order workflows.',
    technologies: [
      {
        name: 'MedusaJS v2',
        version: '2.22 (Framework & Core)',
        role: 'Modular e-commerce backend & headless API engine',
        highlights: [
          'Unified /store/* REST endpoints with publishable API key authorization',
          'Custom Medusa Admin dashboard (/app) for live inventory and order management',
          'Automated order creation workflows with server-side price integrity checks',
          'Event-driven subscriber architecture for async fulfillment triggers',
        ],
        link: 'https://medusajs.com',
      },
      {
        name: 'Studio Dispatch & Pincode Engine',
        version: 'In-House Engine',
        role: 'Dynamic delivery rules & multi-origin courier orchestration',
        highlights: [
          'Pattern specificity engine: Exact 6-digit > Prefix (190*, 560*) > Pan-India (*)',
          'Srinagar Studio & Bengaluru Studio dual origin dispatch routing',
          'Custom Medusa Admin dispatch card for AWB and courier tracking assignment',
          'Automated customer shipping email updates upon fulfillment status transitions',
        ],
      },
      {
        name: 'PDFKit Invoice Engine',
        version: '0.20',
        role: 'High-resolution vector PDF invoice generation',
        highlights: [
          'Automatic invoice numbering (MBS-INV-XXXXXX) with tax itemization',
          'Dynamic circular stamp rendering (PAID IN FULL vs. NOT PAID / COD)',
          'Direct cloud streaming and automated email attachment pipeline',
        ],
        link: 'https://pdfkit.org',
      },
    ],
  },
  {
    category: '3. Data Persistence & Distributed Caching',
    icon: Database,
    description:
      'Reliable data layer ensuring zero data loss during high-traffic drops and container restarts.',
    technologies: [
      {
        name: 'PostgreSQL',
        version: 'v16 (Managed)',
        role: 'Primary relational commerce database',
        highlights: [
          'Houses all Medusa v2 commerce models (products, variants, orders, customers)',
          'Dedicated studio tables: studio_pickup_settings, studio_pincode_rules, studio_bridal_bookings, studio_newsletter_subscribers',
          'Zero-downtime schema migrations via Medusa database workflows',
        ],
        link: 'https://www.postgresql.org',
      },
      {
        name: 'Redis',
        version: 'v7 (Managed)',
        role: 'Durable event bus message queue & distributed lock coordinator',
        highlights: [
          'Durable Pub/Sub queue ensuring no order emails or alerts are dropped during restarts',
          'Atomic distributed locks (SET NX PX) preventing inventory overselling & duplicate payments',
          'Sub-millisecond query cache for tax rules, region configuration, and pricing calculations',
        ],
        link: 'https://redis.io',
      },
    ],
  },
  {
    category: '4. Media Storage & Global Edge CDN',
    icon: Cloud,
    description:
      'Object storage and CDN delivery optimized for fast-loading high-resolution henna artwork and product photography.',
    technologies: [
      {
        name: 'Cloudflare R2',
        version: 'S3-Compatible Object Store',
        role: 'Zero-egress media storage & invoice document archive',
        highlights: [
          'Dedicated bucket: mehandibysana-media',
          'Zero egress fees for media assets served globally',
          'Automated background S3 image sync pipeline with content-type hashing and deduplication',
          'Permanent cloud archive for generated customer PDF invoices (invoices/<id>.pdf)',
        ],
        link: 'https://www.cloudflare.com/developer-platform/r2/',
      },
      {
        name: 'Custom Media CDN Domain',
        version: 'media.mehandibysana.com',
        role: 'Global low-latency asset delivery',
        highlights: [
          'Direct Cloudflare edge caching for WebP, JPEG, and SVG graphics',
          'Custom cache-control headers with automatic origin revalidation',
        ],
      },
    ],
  },
  {
    category: '5. Payments, Security & Anti-Abuse',
    icon: CreditCard,
    description:
      'Bank-grade checkout pipeline supporting Indian prepaid payments, cash on delivery, and edge security.',
    technologies: [
      {
        name: 'Razorpay',
        version: 'Standard Checkout API & Webhooks',
        role: 'Prepaid payment processing (UPI, Credit/Debit Cards, NetBanking)',
        highlights: [
          'PCI-DSS Level 1 compliant seamless overlay checkout',
          'Server-to-server HMAC SHA256 payment signature verification',
          'Idempotent webhook listener ensuring automatic payment capture in Medusa',
        ],
        link: 'https://razorpay.com',
      },
      {
        name: 'Edge Rate Limiting & Protection',
        version: 'In-House Sliding-Window Engine',
        role: 'Bot protection and endpoint abuse mitigation',
        highlights: [
          'Per-IP sliding window rate limiting on /api/contact, /api/newsletter, /api/coupons, /api/pincode',
          'Honeypot protection on public inquiry forms silently sinking bot spam',
          'India DPDP Act (2023) privacy compliance with guest checkout data minimization',
        ],
      },
    ],
  },
  {
    category: '6. SEO, Syndication & Integrations',
    icon: Search,
    description:
      'Search engine syndication that powers top organic rankings for organic henna cones across Google.',
    technologies: [
      {
        name: 'Google Shopping XML Feed',
        version: 'RSS 2.0 / Google Base Namespace',
        role: 'Automated product inventory feed for Google Merchant Center',
        highlights: [
          'Served live at /feed/google-shopping and /api/feed/google-shopping',
          'Full Google taxonomy mapping (Health & Beauty > Hair Care > Hair Color)',
          'Direct Cloudflare R2 image link syndication and INR currency pricing',
          'Helps maintain the #1 Google Shopping rank for organic henna cones',
        ],
      },
      {
        name: 'Telegram Studio Dispatch Channel',
        version: 'Telegram Bot API (@MehandiBySanaBot)',
        role: 'Instant admin push alerts for orders & bridal inquiries',
        highlights: [
          'Dispatches real-time markdown alerts to Sana’s studio team within seconds of purchase',
          'Full item breakdown, customer phone, delivery address, and payment method',
        ],
      },
      {
        name: 'Transactional Mailer',
        version: 'Resend / Brevo / SMTP Transport Fallback',
        role: 'Branded email dispatch for orders, dispatch alerts, and inquiries',
        highlights: [
          'Responsive editorial HTML email templates with inline branding',
          'Automatic PDF invoice attachment and tracking link injection',
        ],
      },
    ],
  },
];

export default function TechStackPage() {
  return (
    <div className="bg-canvas text-ink min-h-screen">
      {/* Hero Header */}
      <section className="relative border-b border-hairline bg-linen/40 py-16 sm:py-24 overflow-hidden">
        <div className="editorial-container">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
              <Code2Icon className="w-4 h-4" />
              <span>Architecture &amp; Engineering</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-ink leading-[1.15]">
              The Technology Stack Behind Mehandi By Sana
            </h1>

            <p className="text-sm sm:text-base text-umber leading-relaxed">
              An open, transparent technical architectural breakdown of our headless
              e-commerce platform. Built from the ground up for sub-second performance,
              reliable order logistics across Kashmir &amp; Bengaluru, and artisanal resilience.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1 text-xs font-medium text-ink">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                Live in Production
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1 text-xs font-medium text-umber">
                <GitBranch className="w-3.5 h-3.5 text-terracotta" />
                Headless Architecture
              </span>
              <a
                href="https://stacknothing.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper px-3 py-1 text-xs font-medium text-ink hover:text-terracotta hover:border-terracotta/40 transition-colors"
              >
                <span>Engineered by</span>
                <span className="font-semibold text-terracotta underline underline-offset-2">stacknothing.com</span>
                <CircleArrowUpRightExit className="w-3.5 h-3.5 text-umber" />
              </a>
              <Link
                href="/changelog"
                className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-dark underline underline-offset-4 ml-1"
              >
                <span>View Release Changelog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Level Architecture Metrics Grid */}
      <section className="border-b border-hairline bg-paper py-8">
        <div className="editorial-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-umber">
                Catalog Latency
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                &lt; 80ms
              </p>
              <p className="text-xs text-umber">Edge ISR caching on Vercel</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-umber">
                Commerce Core
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Medusa v2
              </p>
              <p className="text-xs text-umber">Modular Node.js engine on Railway</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-umber">
                Media Delivery
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                Cloudflare R2
              </p>
              <p className="text-xs text-umber">Zero egress fee global CDN</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-umber">
                Google Shopping
              </span>
              <p className="font-serif text-2xl sm:text-3xl font-medium text-brand-green">
                Rank #1
              </p>
              <p className="text-xs text-umber">Organic henna cone query leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layers Section */}
      <section className="py-16 sm:py-20">
        <div className="editorial-container space-y-16">
          {STACK_LAYERS.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.category}
                className="space-y-6 pt-10 first:pt-0 border-t border-hairline first:border-0"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-linen flex items-center justify-center text-terracotta border border-hairline">
                      <Icon className="w-4 h-4" />
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-medium text-ink">
                      {layer.category}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-umber max-w-2xl">
                    {layer.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {layer.technologies.map((tech) => (
                    <div
                      key={tech.name}
                      className="rounded-xl border border-hairline bg-paper p-5 sm:p-6 space-y-3.5 hover:border-terracotta/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-semibold text-base text-ink">
                              {tech.name}
                            </h3>
                            {tech.version && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-linen text-umber border border-hairline">
                                {tech.version}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-terracotta font-medium mt-0.5">
                            {tech.role}
                          </p>
                        </div>

                        {tech.link && (
                          <a
                            href={tech.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Official website of ${tech.name}`}
                            className="text-umber hover:text-ink transition-colors p-1"
                          >
                            <CircleArrowUpRightExit className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <ul className="space-y-1.5 pt-1">
                        {tech.highlights.map((item, hIdx) => (
                          <li
                            key={hIdx}
                            className="flex items-start gap-2 text-xs text-umber leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Footer Plaque */}
      <section className="border-t border-hairline bg-linen/50 py-14">
        <div className="editorial-container text-center space-y-5 max-w-2xl">
          <BrandCrest tone="auto-badge" size={44} className="mx-auto" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
              Engineered for Artisanal Reliability
            </h2>
            <p className="text-xs sm:text-sm text-umber leading-relaxed">
              Designed, built, and continuously maintained by the product engineering team at{' '}
              <a
                href="https://stacknothing.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink hover:text-terracotta underline underline-offset-4 inline-flex items-center gap-1"
              >
                <span>stacknothing.com</span>
                <CircleArrowUpRightExit className="w-3.5 h-3.5 text-terracotta inline" />
              </a>
              . Explore our release roadmap and version history to see how our engineering
              evolves alongside our small-batch organic henna paste batches.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/changelog" variant="accent" size="md">
              <span>View Release Changelog</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </LinkButton>
            <LinkButton href="/shop" variant="secondary" size="md">
              <span>Explore Products</span>
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function Code2Icon({ className }: { className?: string }) {
  return <FileCode2 className={className} />;
}
