import { Link } from '@heroui/react';
import { getTranslations } from 'next-intl/server';
import { COOKIE_POLICY, PRIVACY_POLICY, TERMS_OF_USE } from '@/lib/routes';

export const Footer = async () => {
  const t = await getTranslations('Footer');
  return (
    <footer className="flex w-full flex-col items-center justify-center gap-1 pb-30 lg:pb-0 lg:py-3">
      <Link href="https://www.manuelfabri.com" target="_blank" rel="noopener noreferrer">
        ManukoDEV
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link href={PRIVACY_POLICY}>{t('links.privacyPolicy')}</Link>
        <Link href={TERMS_OF_USE}>{t('links.termsOfUse')}</Link>
        <Link href={COOKIE_POLICY}>{t('links.cookiePolicy')}</Link>
      </nav>
      <p>
        {new Date().getFullYear()} - {t('rights')}
      </p>
    </footer>
  );
};
