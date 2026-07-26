import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { SYSTEM_TRANSLATION_KEYS } from '@/constants';

export const useTrySystemTranslations = () => {
  const t = useTranslations('System');

  return useCallback((path: string) => (SYSTEM_TRANSLATION_KEYS.includes(path) ? t(path) : path), [t]);
};
