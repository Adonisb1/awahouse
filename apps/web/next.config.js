/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@awahouse/db', '@awahouse/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async redirects() {
    return [
      {
        source: '/agent/dashboard',
        destination: '/agent',
        permanent: true,
      },
      {
        source: '/landlord/dashboard',
        destination: '/landlord',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
