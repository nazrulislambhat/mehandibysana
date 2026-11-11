import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  PolicyDocumentLayout,
  type PolicyTocItem,
} from '@/components/editorial/PolicyDocumentLayout';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Refund, Return & Cancellation Policy',
  description:
    'Perishable fresh organic henna cone rules, 48-hour transit damage claim process, sealed tool returns, cancellations, and 5–7 day Razorpay refund timelines.',
  canonicalPath: '/refund-policy',
  keywords: [
    'Mehandi by Sana refund policy',
    'organic henna return policy',
    'order cancellation henna store',
  ],
});

const TOC: PolicyTocItem[] = [
  { id: 'overview', number: '01', title: 'Overview & Perishable Standard' },
  { id: 'eligibility-matrix', number: '02', title: 'Return & Refund Matrix' },
  {
    id: 'damaged-claims',
    number: '03',
    title: 'Damaged, Leaked or Wrong Item Claims',
  },
  {
    id: 'non-perishable-tools',
    number: '04',
    title: 'Sealed Tools & Dry Accessories',
  },
  {
    id: 'stain-freezer-exclusions',
    number: '05',
    title: 'Exclusions & Freezer Storage Rule',
  },
  {
    id: 'order-cancellations',
    number: '06',
    title: 'Pre-Dispatch Cancellations',
  },
  { id: 'refund-timelines', number: '07', title: 'Refund Timelines & Coupons' },
  { id: 'rto-undelivered', number: '08', title: 'Undelivered & RTO Parcels' },
  {
    id: 'bridal-cancellations',
    number: '09',
    title: 'Bridal & Course Cancellations',
  },
];

export default function RefundPolicyPage() {
  return (
    <PolicyDocumentLayout
      eyebrow="Client Protection & Store Policies"
      title="Refund, Return & Cancellation Policy"
      subtitle="Clear, fair commitments covering small-batch fresh organic henna cones, transit damage replacements, order cancellations, and Razorpay refund timelines."
      effectiveDate="November 10, 2026"
      documentCode="MBS-RP-2026"
      activeSlug="refund"
      toc={TOC}
    >
      <section
        id="overview"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 01</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Overview &amp; Perishable Botanical Standard
        </h2>
        <p className="text-umber">
          Every Mehandi By Sana order is mixed and packed to order in small
          batches across Srinagar and Bengaluru without chemical stabilizers.
          For strict personal hygiene, botanical potency, and food-grade safety
          standards,{' '}
          <strong>
            fresh organic henna cones, prepared paste, opened essential oils,
            and open balms cannot be accepted back once delivered
          </strong>
          , except in cases where your parcel arrived damaged, leaked, tampered,
          incomplete, or incorrect.
        </p>
      </section>

      <section
        id="eligibility-matrix"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-4"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 02</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Quick Return &amp; Refund Eligibility Matrix
        </h2>

        <div className="overflow-x-auto rounded-xl border border-hairline">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-linen border-b border-hairline text-ink">
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Standard Return</th>
                <th className="py-3 px-4 font-semibold">
                  Damaged / Wrong Item
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-umber">
              <tr>
                <td className="py-3 px-4 font-medium text-ink">
                  Fresh Organic Cones &amp; Kits
                </td>
                <td className="py-3 px-4">No (perishable small-batch)</td>
                <td className="py-3 px-4">
                  Free replacement or full refund (48h claim)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">
                  Essential Oils, Balms &amp; Powders
                </td>
                <td className="py-3 px-4">
                  Only if factory seal unbroken (7d)
                </td>
                <td className="py-3 px-4">
                  Free replacement or full refund (48h claim)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">
                  Artist Tools (Sheets, Scales, Bowls)
                </td>
                <td className="py-3 px-4">Eligible within 7 days if unused</td>
                <td className="py-3 px-4">
                  Free replacement or full refund (48h claim)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-ink">
                  Custom Bulk Cone Batches
                </td>
                <td className="py-3 px-4">No (custom rolled to order)</td>
                <td className="py-3 px-4">
                  Replacement or proportional refund (48h claim)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="damaged-claims"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 03</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Damaged, Leaked, Missing, or Wrong Items (48-Hour Window)
        </h2>
        <p className="text-umber">
          If a cone bursts in transit, an oil bottle leaks, an item is missing,
          or you receive the wrong SKU, we take full responsibility and will
          ship a priority replacement batch or issue a refund at no extra
          delivery cost. Please raise your claim within{' '}
          <strong>48 hours of courier delivery timestamp</strong>:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-umber">
          <li>
            Capture clear photos of the outer shipping label/AWB sticker and an{' '}
            <strong>uncut unboxing video</strong> from sealed parcel opening
            showing the damaged or missing items.
          </li>
          <li>
            Email{' '}
            <a
              href="mailto:sana@mehandibysana.com"
              className="text-terracotta underline underline-offset-4 font-medium"
            >
              sana@mehandibysana.com
            </a>{' '}
            or WhatsApp{' '}
            <a
              href="tel:+919149648717"
              className="text-terracotta underline underline-offset-4 font-medium tabular-nums"
            >
              +91-9149648717
            </a>{' '}
            with subject <code>Claim: Your Order Number (MBS-...)</code>.
          </li>
          <li>
            Sana reviews claims within 24 business hours and schedules either
            same-day fresh replacement dispatch or refund initiation.
          </li>
        </ol>
      </section>

      <section
        id="non-perishable-tools"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 04</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Returns on Sealed Tools &amp; Non-Perishable Supplies
        </h2>
        <p className="text-umber">
          Non-perishable items—including sealed pre-cut cellophane sheet packs,
          unused digital micro scales, stainless steel measuring spoons, acrylic
          practice hands, and unused mixing bowls—may be requested for return or
          exchange within <strong>7 days of delivery</strong> provided all tags,
          safety seals, and original packaging remain intact and unused.
        </p>
        <p className="text-umber">
          For voluntary returns (change of mind rather than fulfillment defect
          or transit damage), return courier charges are borne by the customer,
          and original shipping fees paid at checkout are non-refundable.
        </p>
      </section>

      <section
        id="stain-freezer-exclusions"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 05</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Exclusions: Stain Oxidation &amp; Freezer Storage
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Natural Stain Progression:</strong> Pure organic henna
            leaves a bright saffron-orange initial stain immediately after
            flaking the dried paste, deepening to dark mahogany over 24–48
            hours. Immediate bright orange colour is proof of 0% PPD
            authenticity, not product failure.
          </li>
          <li>
            <strong>Improper Storage:</strong> Cones kept outside a deep freezer
            (-18&deg;C) for more than 48 hours post-delivery naturally lose
            potency and are ineligible for refund.
          </li>
          <li>
            <strong>Skin Chemistry / Water Contact:</strong> Washing hands with
            soap/water within the first 12 hours or pre-applying barriers such
            as heavy creams prevents full keratin binding and falls outside
            warranty.
          </li>
        </ul>
      </section>

      <section
        id="order-cancellations"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 06</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Order Cancellation Prior to Dispatch
        </h2>
        <p className="text-umber">
          You may cancel an unshipped storefront order for a{' '}
          <strong>100% full refund</strong> anytime before fresh paste batching
          or courier pickup by messaging your order ID (<code>MBS-...</code>)
          and registered email to{' '}
          <a
            href="mailto:sana@mehandibysana.com"
            className="text-terracotta underline underline-offset-4"
          >
            sana@mehandibysana.com
          </a>{' '}
          or calling{' '}
          <a
            href="tel:+919149648717"
            className="text-terracotta underline underline-offset-4 tabular-nums"
          >
            +91-9149648717
          </a>
          . Once your order status transitions to <strong>Dispatched</strong>{' '}
          and an AWB tracking number is generated, cancellation is no longer
          possible.
        </p>
      </section>

      <section
        id="refund-timelines"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 07</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Refund Processing Timelines &amp; Coupon Calculations
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>
              Razorpay Prepaid Orders (UPI, Cards, NetBanking, Wallets):
            </strong>{' '}
            Once approved, refunds are triggered via Razorpay back to the
            original payment instrument within 24 hours and reflect in your
            bank/card statement within <strong>5–7 business days</strong>{' '}
            depending on issuing bank processing.
          </li>
          <li>
            <strong>Cash on Delivery (COD) / Manual UPI Transfers:</strong>{' '}
            Approved refunds (for damaged claims on paid COD parcels) are
            transferred directly via UPI, IMPS, or NEFT within{' '}
            <strong>3–5 business days</strong> upon receiving your verified UPI
            ID or bank account details.
          </li>
          <li>
            <strong>Coupon &amp; Promotional Discounts:</strong> Refunds always
            equal the actual net monetary amount paid after coupon deductions;
            promotional discount codes themselves cannot be converted into cash.
          </li>
        </ul>
      </section>

      <section
        id="rto-undelivered"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 08</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Undelivered Parcels &amp; Return-to-Origin (RTO)
        </h2>
        <p className="text-umber">
          If a prepaid order is returned as Undelivered / RTO because the
          recipient refused delivery, entered an incomplete address, or failed
          to answer repeated courier calls, reshipping incurs a fresh delivery
          charge. If a customer requests a refund instead of reshipment on an
          RTO parcel, two-way courier costs and spoilt custom-mixed fresh cone
          value (where applicable) may be deducted from the refund.
        </p>
      </section>

      <section
        id="bridal-cancellations"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 09</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Bridal Bookings &amp; Workshop Cancellations
        </h2>
        <p className="text-umber">
          Calendar advance retainers lock Sana&rsquo;s exclusive date allocation
          and cover pre-booking consultations and fresh batch scheduling.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Rescheduling (14+ Days Notice):</strong> One complimentary
            date transfer within 6 months, subject to calendar availability.
          </li>
          <li>
            <strong>Client Cancellation:</strong> Retainer deposits are
            non-refundable for cancellations within 14 days of the event date
            unless a verified force-majeure reschedule is mutually agreed.
          </li>
          <li>
            <strong>Artist Cancellation:</strong> In the rare case Sana cannot
            fulfill a confirmed date due to emergency, 100% of any advance paid
            is refunded within 3 business days.
          </li>
        </ul>
        <div className="pt-3 flex flex-wrap gap-3">
          <LinkButton
            href="/track-order"
            variant="primary"
            size="md"
            className="rounded-md"
          >
            Track an Order
          </LinkButton>
          <LinkButton
            href="/contact?service=order-support"
            variant="secondary"
            size="md"
            className="rounded-md"
          >
            Report a Parcel Issue
          </LinkButton>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}
