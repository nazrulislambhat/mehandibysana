import { NextRequest, NextResponse } from 'next/server';
import { evaluatePincode } from '@/lib/pincode';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pincode: string }> }
) {
  const { pincode } = await params;
  const cleanPin = (pincode || '').trim().replace(/\D/g, '');

  const baseResult = evaluatePincode(cleanPin);

  if (!baseResult.isServiceable) {
    return NextResponse.json(
      {
        success: false,
        ...baseResult,
      },
      { status: 400 }
    );
  }

  // Attempt India Post API lookup for granular post office details
  let postOffices: string[] = [];
  let detailedDistrict = baseResult.district;
  let detailedState = baseResult.state;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // Cache 24 hours
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
        postOffices = data[0].PostOffice.map((p: any) => p.Name).filter(Boolean);
        if (data[0].PostOffice[0]?.District) {
          detailedDistrict = data[0].PostOffice[0].District;
        }
        if (data[0].PostOffice[0]?.State) {
          detailedState = data[0].PostOffice[0].State;
        }
      }
    }
  } catch (err) {
    // Graceful fallback to rule-based engine
  }

  return NextResponse.json({
    success: true,
    ...baseResult,
    district: detailedDistrict || baseResult.district,
    state: detailedState || baseResult.state,
    postOffices,
  });
}
