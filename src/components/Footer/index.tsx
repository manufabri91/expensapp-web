import { StyledLink } from '@/components/StyledLink';
import { getTranslations } from 'next-intl/server';

export const Footer = async () => {
  const t = await getTranslations('Footer');
  return (
    <footer className="flex flex-col items-center justify-center p-4 text-center">
      <StyledLink href="https://www.manuelfabri.com" rel="noopener noreferrer" target="_blank">
        ManukoDEV
      </StyledLink>
      <p>
        {new Date().getFullYear()} - {t('rights')}
      </p>
    </footer>
  );
};
