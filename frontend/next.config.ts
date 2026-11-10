import type { NextConfig } from 'next';

function buildRemotePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  const patterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
    {
      protocol: 'https',
      hostname: 'mehandibysana.com',
    },
    {
      protocol: 'https',
      hostname: '**.mehandibysana.com',
    },
    {
      protocol: 'https',
      hostname: 'mehandibysana.vercel.app',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '9000',
    },
  ];

  for (const rawUrl of [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.WP_BASE_URL,
    process.env.MEDUSA_BACKEND_URL,
    process.env.S3_FILE_URL,
  ]) {
    if (!rawUrl) continue;
    try {
      const parsed = new URL(rawUrl);
      const protocol = parsed.protocol === 'http:' ? 'http' : 'https';
      patterns.push({
        protocol,
        hostname: parsed.hostname,
        ...(parsed.port ? { port: parsed.port } : {}),
      });
    } catch {
      // Ignore malformed URLs during config parsing
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
  async rewrites() {
    return [
      {
        source: '/products/:handle',
        destination: '/product/:handle',
      },
    ];
  },
};

export default nextConfig;
