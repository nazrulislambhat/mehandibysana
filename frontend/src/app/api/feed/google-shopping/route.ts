import { NextResponse } from 'next/server';
import { generateGoogleShoppingFeedXml } from '@/lib/google-shopping-feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const xml = await generateGoogleShoppingFeedXml();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>${err.message || 'Failed to generate feed'}</error>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}
