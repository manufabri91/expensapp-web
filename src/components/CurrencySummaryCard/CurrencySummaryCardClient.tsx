'use client';

import { useTranslations } from 'next-intl';
import { CurrencySummaryCardView } from '@/components/CurrencySummaryCard/CurrencySummaryCardView';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
}

export const CurrencySummaryCardClient = ({ currencySummary, locale }: Props) => {
  const t = useTranslations();

  return <CurrencySummaryCardView currencySummary={currencySummary} locale={locale} t={t} />;
};
