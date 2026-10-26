import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4.5rem 0 3.5rem 0',
          marginBottom: '4rem',
        }}
      >
        <div className="container" style={{ maxWidth: '840px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-primary)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            The Story Behind The Stain
          </span>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            From Electronics Engineering to Pioneering Organic Henna in Kashmir
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Meet Sumaiya Rashid Magray (known as Sana) — an innovator reimagining traditional bridal mehandi through botanical purity and technical precision.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Story Body */}
        <article style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <p>
            In the heart of Srinagar, Kashmir, where centuries of royal craft thrive along the banks of the Jhelum, a quiet revolution began in the world of bridal mehandi. For years, brides were subjected to commercially packaged cones loaded with harsh chemical dyes like paraphenylenediamine (PPD), synthetic solvents, and kerosene to force an instantaneous artificial black stain.
          </p>

          <div
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              borderLeft: '4px solid var(--brand-primary)',
              border: '1px solid var(--border-subtle)',
              fontStyle: 'italic',
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
            }}
          >
            &ldquo;Henna was never meant to be instant, toxic, or skin-damaging. It is an ancient botanical ritual of celebration, cooling therapy, and fragrance. My goal was simple: prove that natural, pure organic henna creates a far deeper, richer mahogany stain than any chemical ever could.&rdquo;
            <br />
            <strong style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.95rem', fontStyle: 'normal' }}>
              — Sumaiya Rashid (Sana)
            </strong>
          </div>

          <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>
            Bridging Technical Precision & Botanical Science
          </h2>
          <p>
            Holding a formal degree in Electronics and Communication Engineering, Sana approached the henna medium with analytical discipline and a relentless pursuit of formulation excellence. She rigorously researched the terpene chemistry of essential oils (eucalyptol, cajeput, and tea tree) and discovered how they optimize lawsone dye release on human skin.
          </p>
          <p>
            Every single batch of paste at <strong>Mehandi By Sana</strong> is mixed fresh in her Baghat Barzullah studio. Triple-cloth sifted 100% pure organic henna powder is combined with fresh lemon hydrosol, unrefined sugars, and high-monoterpene essential oils. Cones are rolled by hand to deliver an ultra-fine 0.38mm tip for intricate bridal lace lines.
          </p>

          <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>
            Zero Compromise on Health & Halal Purity
          </h2>
          <p>
            Because organic henna contains no barrier-forming synthetic lacquers, our formulas are 100% water-permeable and Halal, ensuring complete peace of mind during daily prayers and wudhu. Mothers, children, and brides with sensitive skin can enjoy celebratory henna with zero fear of chemical burns or allergies.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '1.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
              Shop Sana’s Organic Cones
            </Link>
            <Link href="/portfolio" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem' }}>
              View Bridal Designs
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
