/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kbyzubwrzddlmucettjf.supabase.co',
        pathname: '/storage/v1/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/publicContent',
        headers: [{ key: 'Cache-Control', value: 's-maxage=300, stale-while-revalidate=59' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=60' }],
      },
    ];
  },
};

module.exports = nextConfig;

