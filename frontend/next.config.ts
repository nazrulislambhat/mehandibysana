import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mehandibysana.com',
      },
      {
        protocol: 'https',
        hostname: '**.mehandibysana.com',
      },
    ],
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
