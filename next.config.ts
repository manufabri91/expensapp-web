import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // next-auth/@auth/core ship ESM-only packages. Next's own build already handles this fine,
  // but Jest's default transform setup only transforms node_modules packages listed here (see
  // next/jest's transformIgnorePatterns), so tests that import anything touching '@/lib/auth'
  // need this to avoid a "Cannot use import statement outside a module" failure.
  //
  // @heroui/react and @heroui/styles are ESM-only too (package.json `exports.import` with no
  // `require` condition), which otherwise surfaces in Jest as "Cannot find module '@heroui/react'"
  // for any component test that imports it (directly or via '@/components').
  transpilePackages: [
    'next-auth',
    '@auth/core',
    '@panva/hkdf',
    'jose',
    'oauth4webapi',
    'preact',
    'preact-render-to-string',
    '@heroui/react',
    '@heroui/styles',
    'tailwind-variants',
    'esm-env',
    'next-intl',
    'use-intl',
    '@formatjs',
    'intl-messageformat',
  ],
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
