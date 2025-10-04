import { Link } from '@heroui/link';
import { getTranslations } from 'next-intl/server';

export const Footer = async () => {
  const t = await getTranslations('Footer');
  return (
    <footer className="flex w-full flex-col items-center justify-center py-3">
      <Link isExternal href="https://www.manuelfabri.com" title="ManukoDEV. Developer personal site">
        {' '}
        ManukoDEV
      </Link>
      <p>
        {new Date().getFullYear()} - {t('rights')}
      </p>
    </footer>
  );
};
