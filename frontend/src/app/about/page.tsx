'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const services = [
    {
      number: '01',
      title: 'Bridal Henna',
      desc: 'A whole range of bridal design options is available, from simple royal Kashmiri motifs to intricate bespoke lace with heavy detailing.',
    },
    {
      number: '02',
      title: 'Engagement Henna',
      desc: 'Adorn your beautiful hands for the first wedding festivity with delicate organic mandalas, paisleys, and floral cuffs.',
    },
    {
      number: '03',
      title: 'Events & Functions',
      desc: 'Mehandi is always a super hit at all celebrations, family gatherings, corporate celebrations, and festive gatherings.',
    },
    {
      number: '04',
      title: 'Festivals & Eid',
      desc: 'Whether it is Eid al-Fitr, Eid al-Adha, or festive season, our organic cones deliver rich dark stains with no chemicals.',
    },
  ];

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
        <div className="container" style={{ maxWidth: '880px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--brand-primary)',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            The Story Behind The Stain
          </span>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            From Electronics Engineering to <br />
            Pioneering Organic Henna in Kashmir
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto' }}>
            Meet <strong>Sumaiya Rashid Magray (Sana)</strong> — Kashmir’s first freelance Mehandi artist promoting 100% organic henna, an engineer by profession, defying stereotypes through botanical purity.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Story Body */}
        <article style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <p>
            In the heart of Srinagar, Kashmir, where centuries of royal artisan crafts thrive along the banks of the Jhelum, a quiet revolution began in the world of mehandi. For years, brides were subjected to commercially packaged cones loaded with harsh chemical dyes like paraphenylenediamine (PPD), synthetic solvents, and kerosene to force an instantaneous artificial black stain.
          </p>

          <div
            className="card"
            style={{
              padding: '2rem',
              borderLeft: '4px solid var(--brand-primary)',
              fontStyle: 'italic',
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
            }}
          >
            &ldquo;Henna was never meant to be instant, toxic, or skin-damaging. It is an ancient botanical ritual of celebration, cooling therapy, and fragrance. My goal was simple: prove that natural, pure organic henna creates a far deeper, richer mahogany stain than any chemical ever could.&rdquo;
            <br />
            <strong style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.95rem', fontStyle: 'normal', color: 'var(--brand-primary)' }}>
              — Sumaiya Rashid Magray (Sana)
            </strong>
          </div>

          <div>
            <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Bridging Technical Precision & Botanical Science
            </h2>
            <p>
              Holding a formal degree in Electronics and Communication Engineering, Sana approached the henna medium with analytical discipline and a relentless pursuit of formulation excellence. She rigorously researched the terpene chemistry of essential oils (eucalyptol, cineol, and tea tree) and discovered how they optimize lawsone dye release on human skin.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Every single batch of paste at <strong>Mehandi By Sana</strong> is mixed fresh in her Baghat Barzullah studio. Triple-cloth sifted 100% pure organic Rajasthani henna powder is combined with fresh lemon hydrosol, unrefined sugars, and high-monoterpene essential oils. Cones are rolled by hand to deliver an ultra-fine 0.38mm tip for intricate bridal lace lines.
            </p>
          </div>

          {/* Core Services Section from Production */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.06em' }}>
              What I Do
            </span>
            <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Services & Specialties
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {services.map((s) => (
                <div key={s.number} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
                    {s.number}.
                  </div>
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics from Production */}
          <div
            className="card"
            style={{
              padding: '2rem',
              background: 'var(--bg-secondary)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>3,480+</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Website Orders Placed</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-accent)' }}>2,060+</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Happy Clients Served</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-gold)' }}>15 Days</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Masterclass Training</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2e7d32' }}>0%</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PPD / Chemical Dyes</div>
            </div>
          </div>

          {/* Press Coverage from Production */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-accent)', letterSpacing: '0.06em' }}>
              Awards & Honors
            </span>
            <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              Featured In Leading Media
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--brand-accent)' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-accent)', display: 'block', marginBottom: '0.25rem' }}>
                  Greater Kashmir
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  &ldquo;Engineering graduate breaks stereotypes with her henna art&rdquo;
                </p>
                <a
                  href="https://www.greaterkashmir.com/todays-paper/engineering-graduate-breaks-stereotypes-with-her-henna-art"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Read Greater Kashmir Article ↗
                </a>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '3px solid #E1306C' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#E1306C', display: 'block', marginBottom: '0.25rem' }}>
                  Rising Kashmir
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  &ldquo;Watch engineering graduate Sumaiya Rashid Magray defies norms with her stunning henna art&rdquo;
                </p>
                <a
                  href="https://www.facebook.com/therisingkashmir/videos/watch-engineering-graduate-sumaiya-rashid-magray-defies-norms-with-her-stunning-/629453583286646/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Watch Rising Kashmir Video ↗
                </a>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: 'var(--radius-md)' }}>
              Shop Sana’s Organic Cones →
            </Link>
            <Link href="/registration-form" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', borderRadius: 'var(--radius-md)' }}>
              Join Mehandi Masterclass
            </Link>
            <Link href="/contact" className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', borderRadius: 'var(--radius-md)' }}>
              Contact Atelier
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
