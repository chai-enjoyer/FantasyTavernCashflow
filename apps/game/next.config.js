/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/shared", "@repo/firebase", "@repo/game-logic"],
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Enable image format optimization
    formats: ['image/webp'],
    // Device sizes for responsive images
    deviceSizes: [240, 320, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 240, 256, 384],
    // Minimize loading time
    minimumCacheTTL: 31536000, // 1 year in seconds
  },
  // Add headers for caching Firebase Storage images
  async headers() {
    return [
      {
        source: '/:all*(jpg|jpeg|gif|png|webp|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    // Fix for Firebase Auth with Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      "undici": false
    };
    return config;
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig