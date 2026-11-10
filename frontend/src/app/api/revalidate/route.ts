import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerEnv } from '@/lib/env';

interface RevalidatePayload {
  secret?: unknown;
  tag?: unknown;
  slug?: unknown;
  path?: unknown;
}

export async function POST(req: NextRequest) {
  const { revalidateSecret } = getServerEnv();

  if (!revalidateSecret) {
    return NextResponse.json(
      {
        revalidated: false,
        error: 'REVALIDATE_SECRET is not configured on the server.',
      },
      { status: 503 }
    );
  }

  let body: RevalidatePayload = {};
  try {
    body = (await req.json()) as RevalidatePayload;
  } catch {
    body = {};
  }

  const providedSecret =
    req.headers.get('x-revalidate-secret') ||
    req.nextUrl.searchParams.get('secret') ||
    (typeof body.secret === 'string' ? body.secret : null);

  if (!providedSecret || providedSecret !== revalidateSecret) {
    return NextResponse.json(
      { revalidated: false, error: 'Invalid or missing revalidation secret.' },
      { status: 401 }
    );
  }

  const revalidatedTags: string[] = [];
  const requestedTag = typeof body.tag === 'string' ? body.tag.trim() : '';

  if (requestedTag) {
    revalidateTag(requestedTag, 'max');
    revalidatedTags.push(requestedTag);
  } else {
    revalidateTag('products', 'max');
    revalidateTag('categories', 'max');
    revalidatedTags.push('products', 'categories');
  }

  if (typeof body.slug === 'string' && body.slug.trim()) {
    const slugTag = `product:${body.slug.trim()}`;
    revalidateTag(slugTag, 'max');
    revalidatedTags.push(slugTag);
    revalidatePath(`/product/${body.slug.trim()}`);
  }

  if (typeof body.path === 'string' && body.path.startsWith('/')) {
    revalidatePath(body.path);
  } else {
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/sitemap.xml');
  }

  return NextResponse.json({
    revalidated: true,
    tags: revalidatedTags,
    timestamp: new Date().toISOString(),
  });
}

