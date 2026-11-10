import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          color: '#111111',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          border: '16px solid #f7f7f7',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '20px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#d9541e',
            fontWeight: 600,
          }}
        >
          <span>Mehandi by Sana</span>
          <span>•</span>
          <span>mehandibysana.com</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '880px' }}>
          <div
            style={{
              fontSize: '68px',
              lineHeight: 1.12,
              fontFamily: 'Georgia, serif',
              fontWeight: 500,
              color: '#111111',
            }}
          >
            Henna artistry &amp; natural botanical products.
          </div>
          <div
            style={{
              fontSize: '26px',
              lineHeight: 1.5,
              color: '#525252',
              fontFamily: 'sans-serif',
            }}
          >
            Bespoke bridal &amp; celebration mehndi services alongside small-batch organic henna care.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #e5e5e5',
            paddingTop: '24px',
            fontSize: '20px',
            color: '#525252',
          }}
        >
          <span>Botanical Henna Studio &amp; Store</span>
          <span style={{ color: '#d9541e' }}>Shop &amp; Bookings</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

