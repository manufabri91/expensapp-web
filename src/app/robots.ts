import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /dashboard, /transactions, /manage all require a session; /auth/* is the sign-in/register
      // flow, not content; /api/* is the backend-proxy route handler layer - none of these are
      // meant to be indexed.
      disallow: ['/dashboard', '/transactions', '/manage', '/auth/', '/api/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/sitemap.xml`,
  };
}
