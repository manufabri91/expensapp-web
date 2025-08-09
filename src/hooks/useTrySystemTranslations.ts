import { useTranslations } from 'next-intl';
import { SYSTEM_TRANSLATION_KEYS } from '@/constants';

export const useTrySystemTranslations = () => {
  const t = useTranslations('System');

  const translateHandler = (path: string) => {
    return SYSTEM_TRANSLATION_KEYS.includes(path) ? t(path) : path;
  };

  return translateHandler;
};
