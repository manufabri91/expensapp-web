import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // next-auth/@auth/core ship ESM-only packages. Next's own build already handles this fine,
  // but Jest's default transform setup only transforms node_modules packages listed here (see
  // next/jest's transformIgnorePatterns), so tests that import anything touching '@/lib/auth'
  // need this to avoid a "Cannot use import statement outside a module" failure.
  transpilePackages: [
    'next-auth',
    '@auth/core',
    '@panva/hkdf',
    'jose',
    'oauth4webapi',
    'preact',
    'preact-render-to-string',
  ],
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
