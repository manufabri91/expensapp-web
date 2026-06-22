import { Link } from '@heroui/react';
import { getTranslations } from 'next-intl/server';

export const Footer = async () => {
  const t = await getTranslations('Footer');
  return (
    <footer className="flex w-full flex-col items-center justify-center pb-30 lg:pb-0 lg:py-3">
      <Link href="https://www.manuelfabri.com" target="_blank" rel="noopener noreferrer">
        ManukoDEV
      </Link>
      <p>
        {new Date().getFullYear()} - {t('rights')}
      </p>
    </footer>
  );
};
