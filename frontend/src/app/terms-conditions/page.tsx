'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ paddingBottom: '6rem' }}>
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4rem 0 3rem 0',
          marginBottom: '3.5rem',
        }}
      >
        <div className="container" style={{ maxWidth: '840px' }}>
          <h1 className="font-serif" style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Mehandi By Sana • https://mehandibysana.com
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '840px', lineHeight: 1.8, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          <strong>Mehandi By Sana</strong> (&ldquo;we&rdquo; and &ldquo;us&rdquo;) is the operator of <strong>https://mehandibysana.com</strong> (&ldquo;Website&rdquo;). By placing an order through this Website you will be agreeing to the terms below. These are provided to ensure both parties are aware of and agree upon this arrangement to mutually protect and set expectations on our service.
        </p>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            1. General
          </h2>
          <p>
            Subject to stock availability. We try to maintain accurate stock counts on our website but from time to time there may be a stock discrepancy and we will not be able to fulfill all your items at the time of purchase. In this instance, we will fulfill the available products to you, and contact you about whether you would prefer to await the restocking of the back-ordered item or if you would prefer for us to process a refund.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            2. Shipping Costs
          </h2>
          <p>
            Shipping costs are calculated during checkout based on the weight, dimensions, and destination PIN code of the items in the order. Payment for shipping will be collected with the purchase. This price will be the final price for shipping cost to the customer.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            3. Returns & Refunds
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <strong>3.1 Return Due To Change Of Mind:</strong>
              <p>
                Mehandi By Sana will happily accept returns due to change of mind as long as a request to return is received by us within 2 days of receipt of the item and is returned to us in original packaging, unused, and in resellable condition. Return shipping will be paid at the customer&rsquo;s expense and will be required to arrange their own shipping. Once returns are received and accepted, refunds will be processed to the original bank account. We will notify you once this has been completed through email. Mehandi By Sana will refund the value of the goods returned but will NOT refund the value of any shipping paid.
              </p>
            </div>
            <div>
              <strong>3.2 Warranty Returns:</strong>
              <p>
                Mehandi By Sana will happily honor any valid warranty claims, provided a claim is submitted within 7 days of receipt of items. Customers will be required to pre-pay the return shipping, however, we will reimburse you upon successful warranty claim. Upon return receipt of items for a warranty claim, you can expect Mehandi By Sana to process your warranty claim within 7 days. Once the warranty claim is confirmed, you will receive the choice of: (a) refund to your payment method, (b) a refund in store credit, or (c) a replacement item sent to you (if stock is available).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            4. Delivery Terms
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <p><strong>4.1 Transit Time Domestically:</strong> In general, domestic shipments across India are in transit for 2 – 7 days depending on the destination region and express air routes.</p>
            <p><strong>4.2 Transit Time Internationally:</strong> We currently ship domestically across India only.</p>
            <p><strong>4.3 Dispatch Time:</strong> Orders are freshly rolled and usually dispatched within 2 business days of payment of the order. Our Srinagar atelier operates Monday – Sunday during standard business hours.</p>
            <p><strong>4.4 Change Of Delivery Address:</strong> For change of delivery address requests, we are able to update the address at any time before the order has been dispatched.</p>
            <p><strong>4.5 P.O. Box Shipping:</strong> Mehandi By Sana will ship to P.O. box addresses using postal services only.</p>
            <p><strong>4.6 Items Out Of Stock:</strong> If an item is out of stock, we will wait for the item to be available before dispatching your order. Existing items in the order will be reserved while we await this item.</p>
            <p><strong>4.7 Delivery Time Exceeded:</strong> If the delivery time has exceeded the forecasted time, please contact us immediately so that we can conduct an inquiry with the courier partner.</p>
          </div>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            5. Tracking Notifications
          </h2>
          <p>
            Upon dispatch, customers will receive an SMS and email containing a tracking link and AWB number from which they will be able to follow the progress of their shipment based on the latest updates made available by Delhivery or DTDC Air.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            6. Parcels Damaged In Transit
          </h2>
          <p>
            If you find a parcel is damaged in transit, if possible, please reject the parcel from the courier and get in touch with our customer service. If the parcel has been delivered without you being present, please photograph the parcel and contact our team within 24 hours.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            7. Duties & Taxes
          </h2>
          <p>
            Sales tax (GST) has already been applied to the price of the goods as displayed on the website. No unexpected hidden charges will be collected at delivery.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            8. Cancellations
          </h2>
          <p>
            If you change your mind before you have received your order, we are able to accept cancellations at any time before the order has been dispatched. If an order has already been dispatched, please refer to our refund policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            9. Insurance
          </h2>
          <p>
            Parcels are insured for loss and damage up to the value as stated by the courier.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>9.1 Process for parcel damaged in transit:</strong> We will process a replacement or refund as soon as the courier investigation confirms the transit issue.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>9.2 Process for parcel lost in transit:</strong> We will process a replacement or refund as soon as the courier has conducted an investigation and deemed the parcel lost.
          </p>
        </section>

        <section>
          <h2 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
            10. Customer Service
          </h2>
          <p>
            For all customer service inquiries, please contact Sana and the atelier team at:{' '}
            <a href="tel:+919149648717" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
              +91-9149648717
            </a>{' '}
            or visit our{' '}
            <Link href="/contact" style={{ color: 'var(--brand-primary)', fontWeight: 700, textDecoration: 'underline' }}>
              Contact Page
            </Link>
            .
          </p>
        </section>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Link href="/shop" className="btn btn-primary">
            Explore Organic Shop →
          </Link>
          <Link href="/privacy-policy" className="btn btn-outline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
