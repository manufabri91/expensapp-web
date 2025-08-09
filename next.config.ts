import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  publicRuntimeConfig: {
    baseUrl:
      process.env.NEXT_PUBLIC_BASE_URL ||
      `https://${process.env.VERCEL_BRANCH_URL}` ||
      'https://expensapp.manuelfabri.com',
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
