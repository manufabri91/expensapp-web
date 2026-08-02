'use client';

import { useTranslations } from 'next-intl';
import { CurrencySummaryCardView } from '@/components/CurrencySummaryCard/CurrencySummaryCardView';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
  variant?: 'accountBalance' | 'periodTotal';
}

export const CurrencySummaryCardClient = ({ currencySummary, locale, variant }: Props) => {
  const t = useTranslations();

  return <CurrencySummaryCardView currencySummary={currencySummary} locale={locale} t={t} variant={variant} />;
};
