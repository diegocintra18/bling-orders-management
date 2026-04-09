/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bling-orders/core'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  output: 'standalone',
};

module.exports = nextConfig;
