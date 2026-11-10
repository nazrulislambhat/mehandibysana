import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  PolicyDocumentLayout,
  type PolicyTocItem,
} from '@/components/editorial/PolicyDocumentLayout';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Shipping & Delivery Policy',
  description:
    'Small-batch Srinagar & Bangalore dispatch schedule, Pan-India PIN-code delivery estimation, air courier partners, parcel tracking, and fresh cone arrival care.',
  canonicalPath: '/shipping-policy',
  keywords: [
    'Mehandi by Sana shipping policy',
    'organic henna cones delivery India',
    'PIN code henna delivery estimator',
  ],
});

const TOC: PolicyTocItem[] = [
  { id: 'dispatch-schedule', number: '01', title: 'Small-Batch Dispatch Schedule' },
  { id: 'pincode-zones', number: '02', title: 'India PIN-Code Zones & Estimator' },
  { id: 'courier-partners', number: '03', title: 'Courier Partners & Air Routing' },
  { id: 'parcel-tracking', number: '04', title: 'Live Order & Email Tracking' },
  { id: 'fresh-arrival', number: '05', title: 'Care Upon Parcel Arrival' },
  { id: 'failed-attempts', number: '06', title: 'Delivery Attempts & Delays' },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyDocumentLayout
      eyebrow="Logistics & Dispatch"
      title="Shipping & Delivery Policy"
      subtitle="Every cone batch is mixed fresh across our Srinagar & Bangalore studios and routed nationwide by PIN zone for rapid transit."
      effectiveDate="November 10, 2026"
      documentCode="MBS-SP-2026"
      activeSlug="shipping"
      toc={TOC}
    >
      <section
        id="dispatch-schedule"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 01</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Small-Batch Rolling &amp; Dispatch Schedule
        </h2>
        <p className="text-umber">
          Unlike warehouse stock sitting on shelves for months, our organic henna cones are prepared fresh across our{' '}
          <strong>Srinagar (Baghat Barzullah) &amp; Bangalore</strong> studios.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Handling Time:</strong> Standard orders containing fresh cones dispatch within{' '}
            <strong>1–2 business days</strong> after order confirmation so cones arrive at peak dye-release vitality.
          </li>
          <li>
            <strong>Sealed Oils, Powders &amp; Studio Tools:</strong> Usually packed and handed over within{' '}
            <strong>24 business hours</strong> (Monday–Saturday).
          </li>
          <li>
            <strong>Cutoff &amp; Event Deadlines:</strong> Ordering for a wedding or Eid celebration? Please place your order at least{' '}
            <strong>7–10 days ahead</strong> of your celebration date so cones can be safely thawed and patch-tested on schedule.
          </li>
        </ul>
      </section>

      <section
        id="pincode-zones"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-4"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 02</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          India PIN-Code Coverage &amp; On-Demand Rate Check
        </h2>
        <p className="text-umber">
          We dispatch across regional metro hubs and Pan-India destinations based on your 6-digit destination PIN code. Exact delivery charges and estimated courier transit windows for your address are revealed on demand directly inside the Delivery &amp; PIN Estimator on any{' '}
          <Link href="/shop" className="text-terracotta underline underline-offset-4 font-medium">
            product page
          </Link>{' '}
          or within your{' '}
          <Link href="/cart" className="text-terracotta underline underline-offset-4 font-medium">
            shopping bag
          </Link>{' '}
          before checkout.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Srinagar &amp; Bangalore Studio Metro Zones:</strong> Priority 1–2 business day dispatch across local city hubs.
          </li>
          <li>
            <strong>Pan-India Express Coverage:</strong> 3–6 business days via air cargo and India Post Speed Post across serviceable PIN codes nationwide.
          </li>
        </ul>
        <div className="pt-1 flex flex-wrap gap-3">
          <LinkButton href="/shop" variant="primary" size="sm" className="rounded-full">
            Browse Products to Check PIN &rarr;
          </LinkButton>
          <LinkButton href="/cart" variant="secondary" size="sm" className="rounded-full">
            Open Shopping Bag Estimator
          </LinkButton>
        </div>
      </section>

      <section
        id="courier-partners"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 03</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Courier Partners &amp; Priority Air Routing
        </h2>
        <p className="text-umber">
          To minimize ambient exposure for fresh organic paste, inter-state parcels outside Jammu &amp; Kashmir are prioritized via air cargo partners wherever serviceable:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Local Dispatch Hubs (Srinagar &amp; Bangalore):</strong> Priority local studio dispatch for orders across Srinagar and Bengaluru metro zones.
          </li>
          <li>
            <strong>Metro &amp; Pan-India:</strong> DTDC Air, Delhivery Express, Blue Dart, or India Post Speed Post (for remote hill/defense/rural PINs).
          </li>
        </ul>
      </section>

      <section
        id="parcel-tracking"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 04</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Order Confirmation &amp; Automated Shipment Emails
        </h2>
        <p className="text-umber">
          Immediately after placing an order, you receive an order confirmation receipt with your studio reference (<code>MBS-...</code>). As soon as our team completes batch rolling and scans your courier AWB label, an automated shipping notification email with your courier name, AWB number, and direct tracking link is dispatched. You can also check live status anytime via our{' '}
          <Link href="/track-order" className="text-terracotta underline underline-offset-4 font-medium">
            Track Order portal &rarr;
          </Link>
          .
        </p>
      </section>

      <section
        id="fresh-arrival"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 05</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          What to Do Immediately When Your Parcel Arrives
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-umber">
          <li>
            Record a quick unboxing video before breaking the outer tape seal (protects you cleanly under our 48-hour transit damage claim coverage).
          </li>
          <li>
            If ordering fresh organic cones for use later than 48 hours, transfer cones immediately into an airtight zip-pouch inside your{' '}
            <strong>deep freezer (-18&deg;C)</strong>.
          </li>
          <li>
            Read our{' '}
            <Link href="/henna-care" className="text-terracotta underline underline-offset-4 font-medium">
              Thawing &amp; 48-Hour Stain Progression Guide
            </Link>{' '}
            before cutting or pulling any cone pin.
          </li>
        </ol>
      </section>

      <section
        id="failed-attempts"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 06</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Delivery Attempts, Weather Advisories &amp; Delays
        </h2>
        <p className="text-umber">
          Couriers typically make up to 3 delivery attempts and verify availability by phone call or SMS OTP. Please keep your phone accessible during the expected delivery window. Unforeseen weather closures along NH-44 (Jammu–Srinagar corridor), airline cargo restrictions, or civic curfews may occasionally add 1–2 days to outstation transit; if urgent bridal dates approach, contact{' '}
          <a
            href="tel:+919149648717"
            className="text-terracotta underline underline-offset-4 tabular-nums"
          >
            +91-9149648717
          </a>{' '}
          so our team can monitor priority airway routing.
        </p>
        <div className="pt-3 flex flex-wrap gap-3">
          <LinkButton href="/track-order" variant="primary" size="md" className="rounded-full">
            Track My Parcel &rarr;
          </LinkButton>
          <LinkButton href="/refund-policy" variant="secondary" size="md" className="rounded-full">
            Refund Policy
          </LinkButton>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}

