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
  title: 'Terms & Conditions',
  description:
    'Storefront, small-batch organic botanical product, Razorpay & Cash on Delivery payment, shipping, and bridal booking terms for Mehandi by Sana (Srinagar & Bengaluru).',
  canonicalPath: '/terms-conditions',
  keywords: [
    'Mehandi by Sana terms and conditions',
    'henna apothecary storefront terms India',
  ],
});

const TOC: PolicyTocItem[] = [
  { id: 'definitions-scope', number: '01', title: 'Definitions & Brand Identity' },
  { id: 'eligibility-account', number: '02', title: 'Eligibility & Order Accuracy' },
  { id: 'botanical-perishability', number: '03', title: 'Small-Batch Purity & Perishability' },
  { id: 'allergy-safety', number: '04', title: 'Patch Testing & Safe External Use' },
  { id: 'pricing-coupons', number: '05', title: 'Pricing, Taxes & Promo Coupons' },
  { id: 'payments-verification', number: '06', title: 'Payments, Razorpay & Cash on Delivery' },
  { id: 'dispatch-delivery', number: '07', title: 'Dispatch, Transit & Risk of Loss' },
  { id: 'returns-refunds', number: '08', title: 'Returns, Claims & Refunds' },
  { id: 'bridal-workshops', number: '09', title: 'Bridal Appointments & Masterclasses' },
  { id: 'intellectual-property', number: '10', title: 'Intellectual Property & Content' },
  { id: 'liability-limits', number: '11', title: 'Warranties & Limitation of Liability' },
  { id: 'governing-law', number: '12', title: 'Governing Law & Dispute Resolution' },
];

export default function TermsConditionsPage() {
  return (
    <PolicyDocumentLayout
      eyebrow="Legal & Service Commitments"
      title="Terms & Conditions"
      subtitle="Please review these terms carefully before ordering small-batch organic henna products, reserving bridal mehandi dates, or using mehandibysana.com."
      effectiveDate="November 10, 2026"
      documentCode="MBS-TC-2026"
      activeSlug="terms"
      toc={TOC}
    >
      <section
        id="definitions-scope"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 01</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Definitions &amp; Brand Identity
        </h2>
        <p className="text-umber">
          This storefront (<strong>mehandibysana.com</strong>) is operated by{' '}
          <strong>Mehandi by Sana</strong>, founded in 2019 by independent freelance artist Sumaiya Rashid Magray (Sana), working across{' '}
          <strong>Baghat Barzullah, Srinagar (Jammu &amp; Kashmir 190005)</strong> and{' '}
          <strong>Bengaluru (Karnataka), India</strong>.
        </p>
        <p className="text-umber">
          Throughout these Terms &amp; Conditions, &ldquo;Mehandi by Sana&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; refers to Sumaiya Rashid Magray&rsquo;s independent practice and botanical apothecary, and &ldquo;Customer&rdquo;, &ldquo;Client&rdquo;, or &ldquo;you&rdquo; refers to any person browsing the storefront, purchasing physical apothecary goods or artist tools, enrolling in training courses, or submitting a bridal/event booking inquiry. Accessing our website or completing checkout constitutes binding acceptance of these Terms, alongside our{' '}
          <Link href="/privacy-policy" className="text-terracotta underline underline-offset-4">
            Privacy Policy
          </Link>
          ,{' '}
          <Link href="/refund-policy" className="text-terracotta underline underline-offset-4">
            Refund Policy
          </Link>
          , and{' '}
          <Link href="/shipping-policy" className="text-terracotta underline underline-offset-4">
            Shipping Policy
          </Link>
          .
        </p>
      </section>

      <section
        id="eligibility-account"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 02</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Eligibility &amp; Order Information Accuracy
        </h2>
        <p className="text-umber">
          By placing an order or booking inquiry, you represent that you are at least 18 years of age (or ordering under parental/guardian supervision) and legally capable of entering into a contract under the Indian Contract Act, 1872.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            You agree to provide truthful full name, deliverable street address, accurate 6-digit Indian PIN code, active mobile/WhatsApp number, and reachable email address.
          </li>
          <li>
            Mehandi by Sana is not responsible for courier delays, spoilt fresh cones, or Return-to-Origin (RTO) surcharges resulting from incomplete house numbers, mismatched PIN codes, or unreachable delivery phone numbers.
          </li>
        </ul>
      </section>

      <section
        id="botanical-perishability"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 03</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Small-Batch Purity &amp; Mandatory Perishable Care
        </h2>
        <p className="text-umber">
          Every organic henna cone sold by Mehandi by Sana is hand-mixed in small batches using triple-sifted Sojat henna leaf powder, pure steam-distilled essential oils (eucalyptus, lavender, or cajeput), sugar, and lemon hydrosol, with{' '}
          <strong>0% PPD, ammonia, synthetic dyes, or chemical preservatives</strong>.
        </p>
        <div className="rounded-xl border border-terracotta/35 bg-linen p-4 text-xs sm:text-sm text-ink space-y-1.5">
          <p className="font-semibold text-terracotta uppercase tracking-[0.12em] text-[11px]">
            Critical Storage Requirement (-18&deg;C)
          </p>
          <p className="text-umber">
            Fresh hand-rolled cones begin natural dye release immediately and remain potent for only a limited ambient transit window. Unused cones{' '}
            <strong>must be stored in an airtight pouch inside a deep freezer (-18&deg;C) within 48 hours of delivery</strong>{' '}
            (lasting up to 3–4 months frozen). Leaving cones unrefrigerated degrades stain depth and is excluded from replacement claims. See our{' '}
            <Link href="/henna-care" className="text-terracotta underline underline-offset-4 font-medium">
              Henna Storage &amp; Stain Care Guide
            </Link>
            .
          </p>
        </div>
        <p className="text-umber">
          Because we harvest agricultural botanicals without artificial thickeners or dyes, minor variations in seasonal leaf hue, paste viscosity, or natural oil aroma between harvests are normal hallmarks of genuine organic craft.
        </p>
      </section>

      <section
        id="allergy-safety"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 04</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Patch Testing, Essential Oils &amp; External Use Notice
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-umber">
          <li>
            <strong>External Application Only:</strong> All cones, essential oils, aftercare balms, and hair henna powders are intended strictly for external skin or hair cosmetic/ritual use.
          </li>
          <li>
            <strong>Sensitivity &amp; Patch Test:</strong> Even pure botanical essential oils (such as clove or eucalyptus oil) can occasionally trigger dermal sensitivity on highly reactive skin. We strongly recommend applying a small drop on the inner wrist or behind the ear 24 hours prior to full bridal or scalp application.
          </li>
          <li>
            <strong>Medical Contraindications:</strong> Natural lawsone (henna) should not be used by individuals with Glucose-6-Phosphate Dehydrogenase (G6PD) deficiency, open wounds, or broken skin. Discontinue use immediately and consult a physician if irritation occurs.
          </li>
        </ul>
      </section>

      <section
        id="pricing-coupons"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 05</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Pricing, GST, Currency &amp; Promotional Coupons
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            All storefront prices are quoted in <strong>Indian Rupees (INR / &#8377;)</strong> and are inclusive of applicable GST unless explicitly stated otherwise.
          </li>
          <li>
            PIN-code delivery charges are calculated dynamically for your 6-digit PIN code and can be checked beforehand on any product page, inside your shopping bag estimator, or at checkout prior to payment (see our{' '}
            <Link href="/shipping-policy" className="text-terracotta underline underline-offset-4">
              Shipping Policy
            </Link>
            ).
          </li>
          <li>
            Promotional coupon codes may specify percentage or fixed-INR discounts, minimum order subtotals, active validity windows, and single-use or total usage caps. Coupons cannot be combined sequentially, transferred for cash value, or applied retroactively after an order has been placed.
          </li>
          <li>
            In the event of a manifest pricing or catalog display error, we reserve the right to cancel the affected order prior to dispatch and issue a complete refund of any captured payment.
          </li>
        </ul>
      </section>

      <section
        id="payments-verification"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 06</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Checkout Payments, Razorpay Verification &amp; Cash on Delivery
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Online Prepaid Orders:</strong> Processed over HTTPS via Razorpay&rsquo;s PCI-DSS Level 1 compliant payment infrastructure supporting UPI, Credit/Debit Cards, NetBanking, and Wallets. Orders are confirmed only after cryptographic HMAC-SHA256 payment verification.
          </li>
          <li>
            <strong>Cash on Delivery (COD):</strong> Available on eligible Indian PIN codes subject to courier serviceability. Customers placing COD orders agree to remit the full invoice total in cash or instant verified UPI upon parcel presentation. Repeated COD refusals may restrict future COD eligibility.
          </li>
          <li>
            <strong>100% Promotional Coupon Orders:</strong> Orders whose verified grand total equals &#8377;0 after a valid promo voucher bypass gateway payment and proceed directly into dispatch review.
          </li>
        </ul>
      </section>

      <section
        id="dispatch-delivery"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 07</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Preparation Lead Times, Courier Transit &amp; Risk of Loss
        </h2>
        <p className="text-umber">
          Fresh henna orders are typically mixed, rolled, sealed, and dispatched from Srinagar or Bengaluru within 1–2 business days (excluding severe weather closures or national holidays). Once scanned by our logistics partner (Delhivery, DTDC Air, Blue Dart, or India Post Speed Post), transit tracking details are emailed to your checkout address and viewable anytime on our{' '}
          <Link href="/track-order" className="text-terracotta underline underline-offset-4">
            Order Tracker
          </Link>
          .
        </p>
      </section>

      <section
        id="returns-refunds"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 08</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Cancellations, Returns &amp; Refunds
        </h2>
        <p className="text-umber">
          Because freshly rolled organic henna cones and unsealed botanical oils are hygiene-sensitive and perishable, they cannot be returned after dispatch unless received physically damaged, leaked, or incorrect. Complete rules, evidence requirements, and refund processing timelines (5–7 business days) are set out in our dedicated{' '}
          <Link
            href="/refund-policy"
            className="text-terracotta hover:text-terracotta-dark underline underline-offset-4 font-medium"
          >
            Refund, Return &amp; Cancellation Policy &rarr;
          </Link>
          .
        </p>
      </section>

      <section
        id="bridal-workshops"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 09</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Bridal Appointments, Event Bookings &amp; Masterclasses
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Inquiry vs. Confirmed Date:</strong> Submitting the contact form generates an inquiry reference (<code>INQ-...</code>) and does not guarantee date reservation until availability is confirmed by Sana and any quoted advance retainer is received.
          </li>
          <li>
            <strong>Event Readiness:</strong> Clients must ensure adequate seating, daylight or bright warm lighting, and calm drying space at the home or venue. Waxing, manicures, and pedicures should be completed at least 24 hours before mehandi application so skin pores and lotions do not block lawsone absorption.
          </li>
          <li>
            <strong>Outstation Travel:</strong> Destination bookings outside Srinagar &amp; Bengaluru city limits may carry separate travel, lodging, or local conveyance terms confirmed in writing prior to booking lock.
          </li>
          <li>
            <strong>Masterclasses:</strong> Course schedules and &#8377;3,500 batch registrations follow the confirmed intake dates communicated upon enrollment.
          </li>
        </ul>
      </section>

      <section
        id="intellectual-property"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 10</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Intellectual Property &amp; Brand Content
        </h2>
        <p className="text-umber">
          The brand name <strong>MEHANDI BY SANA</strong>, logo marks, product formulations, photography, original Chinar and Mughal bridal design plates, botanical illustrations, stain guide visuals, and editorial copy on mehandibysana.com are the exclusive intellectual property of Sumaiya Rashid Magray (Mehandi by Sana). Visitors may view or save personal bridal reference inspiration with attribution, but may not scrape, commercially reproduce, counterfeit product labels, or falsely claim affiliation.
        </p>
      </section>

      <section
        id="liability-limits"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 11</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Natural Results Disclaimer &amp; Limitation of Liability
        </h2>
        <p className="text-umber">
          Natural botanical stain darkness varies naturally across skin thickness, body warmth, circulation, pre-application oils/lotions, and post-removal water avoidance. While our formulations are crafted for rich mahogany oxidation, no artificial chemical guarantees are made. To the maximum extent permitted by Indian law, Mehandi by Sana&rsquo;s total cumulative liability for any claim relating to an order or booking shall not exceed the actual amount paid by the Customer for that specific order or booking.
        </p>
      </section>

      <section
        id="governing-law"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Clause 12</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Governing Law, Consumer Redressal &amp; Updates
        </h2>
        <p className="text-umber">
          These Terms are governed by the laws of India, including applicable provisions of the Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020. Any disputes arising out of orders or service engagements shall be subject to the exclusive jurisdiction of the competent courts in{' '}
          <strong>Srinagar, Jammu &amp; Kashmir, India</strong>. We may update these Terms periodically by revising the effective date above; continued storefront use indicates acceptance of updated terms.
        </p>
        <div className="pt-3 flex flex-wrap gap-3">
          <LinkButton href="/refund-policy" variant="primary" size="md" className="rounded-full">
            Read Refund Policy &rarr;
          </LinkButton>
          <LinkButton href="/privacy-policy" variant="secondary" size="md" className="rounded-full">
            Privacy Policy
          </LinkButton>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}
