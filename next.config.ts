import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  publicRuntimeConfig: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_BRANCH_URL || 'https://expensapp.manuelfabri.com',
  },
};

export default nextConfig;
