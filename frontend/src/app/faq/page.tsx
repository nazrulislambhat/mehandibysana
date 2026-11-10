import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  PolicyDocumentLayout,
  type PolicyTocItem,
} from '@/components/editorial/PolicyDocumentLayout';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ)',
  description:
    'Answers on 100% PPD-free organic henna cones, -18°C freezing, 48-hour stain darkness, PIN-code shipping, Razorpay payments, refunds, and Srinagar & Bangalore bridal bookings.',
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  number: string;
  title: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'ingredients-purity',
    number: '01',
    title: 'Organic Cones & Botanical Purity',
    items: [
      {
        question: 'Are Mehandi by Sana cones 100% chemical-free and PPD-free?',
        answer:
          'Yes. Every cone is mixed from triple-cloth sifted Sojat (Rajasthan) organic henna leaf powder, pure steam-distilled essential oils (eucalyptus, lavender, or cajeput), raw sugar, and filtered water or lemon hydrosol. We never add PPD, metallic salts, ammonia, artificial dyes, or synthetic preservatives.',
      },
      {
        question: 'Why did my stain start bright orange instead of dark brown immediately?',
        answer:
          'Pure organic lawsone always reveals a luminous saffron-tangerine stain right after flaking off dried paste. Over the next 24 to 48 hours, natural epidermal oxidation deepens it into lush espresso-mahogany. Instant black or burgundy cones indicate chemical dye adulteration—never pure henna.',
      },
      {
        question: 'What is the cone tip size and weight?',
        answer:
          'Our signature cellophane cones are hand-rolled to a crisp 0.38mm ultra-fine pin tip (~25g standard fill) so brides and professional artists can draw delicate Mughal arches, jali grids, and floral shading cleanly without hand fatigue.',
      },
      {
        question: 'Are your organic cones safe for pregnant women and children?',
        answer:
          'Yes, our natural skin-safe lavender and pure henna formulations avoid harsh petrochemicals or synthetic solvents. For expecting mothers or children with sensitive skin, please inform us when ordering or select gentle lavender formulations, and perform a small inner-wrist patch test 24 hours prior.',
      },
    ],
  },
  {
    id: 'storage-stain',
    number: '02',
    title: 'Freezer Storage & Dark Stain Tips',
    items: [
      {
        question: 'How long do fresh cones stay fresh? Do I really need a freezer?',
        answer:
          'Fresh preservative-free cones stay peak-potent for ~48 hours at cool room temperature or ~4–5 days chilled. Immediately transfer unused cones into an airtight pouch in your deep freezer (-18°C or colder) within 48 hours of delivery, where they keep vibrant dye release for 3–4 months.',
      },
      {
        question: 'How should I thaw frozen cones without ruining the paste?',
        answer:
          'Set frozen cones on a counter at room temperature for 15–20 minutes until smooth. Never heat them in a microwave or hot water bowl, as sudden heat degrades essential oils and causes premature dye fading.',
      },
      {
        question: 'What maximizes stain darkness on the hands and feet?',
        answer:
          'Apply to clean bare skin with zero lotion, leave paste on 4–6+ hours (seal lightly with sugar-lemon or Sana sealant), scrape crumbs off using Sana Stain Darkening Balm or sweet oil—never water—and minimize handwashing or soap contact for 12–24 hours afterward.',
      },
    ],
  },
  {
    id: 'shipping-tracking',
    number: '03',
    title: 'Shipping, PIN Zones & Tracking',
    items: [
      {
        question: 'How fast do orders dispatch from your Srinagar & Bangalore studios?',
        answer:
          'Small-batch organic cone orders are rolled fresh and dispatched within 1–2 business days via DTDC Air, Delhivery, Blue Dart, or India Post Speed Post. Transit takes 1–2 business days across local Srinagar & Bangalore metro PINs and 3–6 business days Pan-India. Enter your 6-digit PIN on any product page or inside your shopping bag to check exact delivery rates and ETA for your address.',
      },
      {
        question: 'How can I track my order after checkout?',
        answer:
          'Use our live Order Tracker page anytime with your order reference (e.g., MBS-...) and checkout email. You also receive automated order confirmation and shipment AWB emails when your parcel dispatches.',
      },
      {
        question: 'Do you support Cash on Delivery (COD) and online UPI/Card payments?',
        answer:
          'Yes. Online payments run over Razorpay (UPI, Google Pay, PhonePe, Credit/Debit Cards, NetBanking, Wallets) with encrypted cryptographic verification, and Cash on Delivery is supported across serviceable India PIN codes.',
      },
    ],
  },
  {
    id: 'refunds-cancellations',
    number: '04',
    title: 'Cancellations, Refunds & Claims',
    items: [
      {
        question: 'Can I cancel an order after placing it?',
        answer:
          'Yes—contact +91-9149648717 or sana@mehandibysana.com with your MBS reference prior to batch dispatch for a full 100% refund. Once the parcel has been scanned for courier transit, cancellation is unavailable.',
      },
      {
        question: 'What if a cone leaks or items arrive damaged?',
        answer:
          'Send a clear uncut 360° unboxing video and shipping label photos within 48 hours of delivery to sana@mehandibysana.com or WhatsApp +91-9149648717. Approved claims receive a free priority replacement or full refund (settled within 5–7 business days via Razorpay or 3–5 days for UPI/NEFT).',
      },
    ],
  },
  {
    id: 'bridal-workshops',
    number: '05',
    title: 'Bridal Bookings & Mehandi Masterclasses',
    items: [
      {
        question: 'How far in advance should I reserve Sana for my bridal mehndi?',
        answer:
          'For peak Kashmir wedding seasons and Eid weeks, we recommend inquiring 4–8 weeks in advance via our Booking Inquiry page. Dates are locked once availability and your booking retainer are confirmed.',
      },
      {
        question: 'Which cities do you serve for bridal mehndi, and do you travel for destination weddings?',
        answer:
          'We operate directly from Srinagar and Bangalore, and Sana and our troupe also travel across Jammu & Kashmir, Karnataka, and outstation Indian destinations—with travel and hospitality terms shared transparently in your custom booking proposal.',
      },
    ],
  },
];

const TOC: PolicyTocItem[] = FAQ_GROUPS.map((g) => ({
  id: g.id,
  number: g.number,
  title: g.title,
}));

export default function FaqPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  };

  return (
    <PolicyDocumentLayout
      eyebrow="Client Concierge & Answers"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about 100% pure organic henna cones, -18°C freezer storage, stain development, Pan-India dispatch, refunds, and bridal bookings."
      effectiveDate="Updated November 2026"
      documentCode="MBS-FAQ"
      activeSlug="faq"
      toc={TOC}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
        }}
      />

      {FAQ_GROUPS.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-5"
        >
          <div className="border-b border-hairline pb-3">
            <p className="font-serif text-xs italic text-terracotta">
              Topic {group.number}
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ink mt-0.5">
              {group.title}
            </h2>
          </div>

          <div className="space-y-3">
            {group.items.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-hairline bg-canvas px-5 py-4 open:border-terracotta/50"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-sm sm:text-base font-medium text-ink">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-terracotta text-lg leading-none font-semibold shrink-0 transition-transform duration-200 group-open:rotate-45 mt-0.5"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-umber leading-relaxed border-t border-hairline/70 pt-3">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-hairline bg-ink text-inverse p-7 sm:p-8 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta">
          Still Have Questions?
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-inverse">
          Speak directly with our studio coordinators
        </h2>
        <p className="text-sm text-inverse/75 leading-relaxed">
          Need guidance picking cone counts for a bridal event, verifying an order reference, or planning an urgent delivery? Reach out anytime.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <LinkButton href="/contact" variant="primary" size="md" className="rounded-full">
            Ask Studio Desk &rarr;
          </LinkButton>
          <Link
            href="/henna-care"
            className="inline-flex items-center justify-center min-h-[44px] rounded-full border border-inverse/30 px-5 py-2 text-sm font-medium text-inverse hover:border-inverse hover:bg-inverse/10 transition-colors"
          >
            Read Stain Care Guide
          </Link>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}

