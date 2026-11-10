import React from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import {
  PolicyDocumentLayout,
  type PolicyTocItem,
} from '@/components/editorial/PolicyDocumentLayout';
import { LinkButton } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy & Data Protection',
  description:
    'Privacy practices, India DPDP Act 2023 compliance, Razorpay PCI-DSS payment security, essential storage disclosure, and Grievance Officer details for Mehandi by Sana.',
  canonicalPath: '/privacy-policy',
  keywords: [
    'Mehandi by Sana privacy policy',
    'DPDP Act 2023 henna store privacy',
  ],
});

const TOC: PolicyTocItem[] = [
  { id: 'data-fiduciary', number: '01', title: 'Data Fiduciary & Scope' },
  { id: 'information-collected', number: '02', title: 'Personal Information We Collect' },
  { id: 'purpose-lawful-use', number: '03', title: 'Purpose & Lawful Processing' },
  { id: 'cookies-storage', number: '04', title: 'Cookies & Browser Storage' },
  { id: 'razorpay-security', number: '05', title: 'Payment Security & Verification' },
  { id: 'third-party-sharing', number: '06', title: 'Trusted Service Partners' },
  { id: 'data-retention', number: '07', title: 'Data Retention & Safeguards' },
  { id: 'your-rights', number: '08', title: 'Your Rights (DPDP Act, 2023)' },
  { id: 'minors-updates', number: '09', title: 'Children & Policy Updates' },
  { id: 'grievance-officer', number: '10', title: 'Grievance Officer & Contact' },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyDocumentLayout
      eyebrow="Privacy & Data Protection"
      title="Privacy Policy"
      subtitle="How Mehandi by Sana respects, secures, and minimizes your personal information across purchases, order tracking, bridal bookings, and direct communications."
      effectiveDate="November 10, 2026"
      documentCode="MBS-PP-2026"
      activeSlug="privacy"
      toc={TOC}
    >
      <section
        id="data-fiduciary"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 01</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Data Fiduciary Identity &amp; Scope
        </h2>
        <p className="text-umber">
          This Privacy Policy describes how <strong>Mehandi by Sana</strong> (operating from Baghat Barzullah, Srinagar, J&amp;K 190005 and Bangalore, Karnataka) collects, uses, stores, and protects personal data when you visit{' '}
          <strong>mehandibysana.com</strong>, place storefront orders, use our PIN code or order tracking utilities, subscribe to fresh batch notifications, or submit bridal/workshop inquiries, in alignment with India&rsquo;s{' '}
          <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> and Information Technology Rules.
        </p>
      </section>

      <section
        id="information-collected"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 02</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Personal Information We Collect
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-umber">
          <li>
            <strong>Checkout &amp; Order Details:</strong> First and last name, email address, phone/WhatsApp number, street shipping address, city, state, 6-digit PIN code, applied coupon code, and optional special delivery instructions.
          </li>
          <li>
            <strong>Order Tracking Verification:</strong> Order reference ID (e.g., <code>MBS-...</code>) and matching checkout email when querying our order tracker.
          </li>
          <li>
            <strong>Bridal &amp; Event Booking Inquiries:</strong> Full name, email, phone/WhatsApp, selected service tier, preferred ceremony date, event venue/city, and design notes submitted through our Contact form.
          </li>
          <li>
            <strong>Fresh Batch Dispatch List (Optional):</strong> Email address explicitly submitted to receive notifications when fresh henna cone batches open.
          </li>
          <li>
            <strong>Anti-Spam &amp; Security Protection:</strong> Invisible honeypot validation fields and minimal server request logs solely to protect forms against automated abuse.
          </li>
        </ul>
      </section>

      <section
        id="purpose-lawful-use"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 03</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Purpose &amp; Lawful Basis of Processing
        </h2>
        <p className="text-umber">
          We process your information strictly for legitimate operational purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>Preparing fresh batches, generating GST/order records, and dispatching parcels to your PIN code.</li>
          <li>
            Sending essential transactional communications: order confirmation receipts, Razorpay/offline payment confirmations, AWB shipping notifications, delivery confirmations, and bridal booking responses.
          </li>
          <li>Responding to return, replacement, refund, or customer care requests.</li>
          <li>
            Sending seasonal batch availability or release announcements strictly when you opt into the Fresh Batch Dispatch List or are an active client (with instant opt-out).
          </li>
        </ul>
      </section>

      <section
        id="cookies-storage"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 04</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Cookies, Local Storage &amp; Zero Ad-Tracking Commitment
        </h2>
        <p className="text-umber">
          We minimize browser storage to what is genuinely necessary for a fast, smooth shopping bag:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Essential Shopping Bag &amp; Cart State:</strong> Local browser storage persists your selected cone/product quantities, active coupon code, and checked 6-digit PIN delivery estimate across page navigations.
          </li>
          <li>
            <strong>No Third-Party Data Brokering:</strong> We do <strong>not</strong> sell, rent, or auction your phone number or email address to third-party marketing aggregators or ad networks.
          </li>
        </ul>
      </section>

      <section
        id="razorpay-security"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 05</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Checkout &amp; Payment Security
        </h2>
        <p className="text-umber">
          Sensitive financial credentials—such as full credit/debit card numbers, CVV codes, UPI PINs, or netbanking passwords—are never collected, viewed, or stored by Mehandi by Sana servers. All online transactions run directly over encrypted TLS inside{' '}
          <strong>Razorpay&rsquo;s PCI-DSS Level 1</strong> certified environment, and our backend verifies every payment using cryptographic HMAC-SHA256 signatures before marking an order paid.
        </p>
      </section>

      <section
        id="third-party-sharing"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 06</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Limited Operational Data Sharing
        </h2>
        <p className="text-umber">
          We share only the minimum data needed with verified operational partners bound to confidentiality:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Courier &amp; Logistics Partners</strong> (Delhivery, DTDC, Blue Dart, India Post): Name, delivery address, PIN code, and phone number to complete doorstep delivery and OTP/NDR verification.
          </li>
          <li>
            <strong>Payment Gateway</strong> (Razorpay Software Pvt. Ltd.): Transaction amount, order reference, customer contact email/phone for payment execution, fraud screening, and statutory refunds.
          </li>
          <li>
            <strong>Transactional Email &amp; Cloud Infrastructure</strong> (Resend / Brevo / authenticated SMTP, Vercel, Railway managed PostgreSQL): Encrypted delivery of transactional notifications and order records.
          </li>
        </ul>
      </section>

      <section
        id="data-retention"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 07</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Data Retention &amp; Security Measures
        </h2>
        <p className="text-umber">
          Order invoices, shipping records, and tax ledgers are retained for statutory periods required under Indian accounting and GST regulations. Bridal inquiries and newsletter preferences are kept only as long as reasonably useful for client service or until you request removal. Access to administrative databases and secret API tokens is restricted behind authenticated sessions and server-side TLS encryption.
        </p>
      </section>

      <section
        id="your-rights"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 08</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Your Rights as a Data Principal (DPDP Act, 2023)
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-umber">
          <li>
            <strong>Right to Access:</strong> Request confirmation and a clear summary of personal data held about your orders or inquiries.
          </li>
          <li>
            <strong>Right to Correction &amp; Updating:</strong> Update misspelled emails, shipping addresses, or phone details prior to dispatch.
          </li>
          <li>
            <strong>Right to Erasure &amp; Consent Withdrawal:</strong> Request removal of non-statutory personal details or opt out of all broadcast emails anytime by emailing us or replying &ldquo;Unsubscribe&rdquo; to any batch announcement.
          </li>
        </ul>
      </section>

      <section
        id="minors-updates"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 09</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Children&rsquo;s Privacy &amp; Policy Updates
        </h2>
        <p className="text-umber">
          Our online store is intended for adults aged 18 and above. If we become aware that personal data of a minor has been submitted without verifiable parent/guardian consent, we will promptly delete those details upon notice. Changes to this policy are reflected by updating the Effective Date at the top of this dossier.
        </p>
      </section>

      <section
        id="grievance-officer"
        className="scroll-mt-28 rounded-2xl border border-hairline bg-paper p-6 sm:p-8 space-y-3"
      >
        <p className="font-serif text-xs italic text-terracotta">Section 10</p>
        <h2 className="font-serif text-2xl font-medium text-ink">
          Grievance Officer &amp; Privacy Inquiries
        </h2>
        <p className="text-umber">
          To exercise any privacy right, withdraw consent, or report a data concern, contact our designated Grievance Officer directly:
        </p>
        <div className="rounded-xl border border-hairline bg-linen p-4 text-xs sm:text-sm space-y-1 text-ink">
          <p>
            <strong>Name:</strong> Sumaiya Rashid Magray (Sana), Founder &amp; Privacy Officer
          </p>
          <p>
            <strong>Service Bases:</strong> Mehandi by Sana &middot; Baghat Barzullah, Srinagar (J&amp;K 190005) &amp; Bangalore (Karnataka)
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a
              href="mailto:sana@mehandibysana.com"
              className="text-terracotta underline underline-offset-4"
            >
              sana@mehandibysana.com
            </a>
          </p>
          <p>
            <strong>Phone:</strong>{' '}
            <a
              href="tel:+919149648717"
              className="text-terracotta underline underline-offset-4 tabular-nums"
            >
              +91-9149648717
            </a>{' '}
            (Acknowledge within 48 hours)
          </p>
        </div>
        <div className="pt-3 flex flex-wrap gap-3">
          <LinkButton href="/terms-conditions" variant="primary" size="md" className="rounded-full">
            Terms &amp; Conditions &rarr;
          </LinkButton>
          <LinkButton href="/contact" variant="secondary" size="md" className="rounded-full">
            Contact Sana
          </LinkButton>
        </div>
      </section>
    </PolicyDocumentLayout>
  );
}
