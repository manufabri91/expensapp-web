import { getTranslations } from 'next-intl/server';
import { LegalPageLayout } from '@/components/LegalPageLayout';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.legal.cookiePolicy' });

  return {
    title: {
      default: t('title'),
    },
    description: t('description'),
  };
}

export default async function CookiePolicyPage() {
  const t = await getTranslations('LegalCookiePolicy');

  return (
    <LegalPageLayout
      title={t('title')}
      lastUpdated={t('lastUpdated')}
      disclaimer={t('disclaimer')}
      sections={t.raw('sections')}
    />
  );
}
