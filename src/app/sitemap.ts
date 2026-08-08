import type { MetadataRoute } from 'next';
import { COOKIE_POLICY, PRIVACY_POLICY, TERMS_OF_USE } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...[PRIVACY_POLICY, TERMS_OF_USE, COOKIE_POLICY].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
