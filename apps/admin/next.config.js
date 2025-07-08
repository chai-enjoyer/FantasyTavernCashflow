/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/shared", "@repo/firebase", "@repo/game-logic"],
  output: 'export',
  images: {
    unoptimized: true,
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