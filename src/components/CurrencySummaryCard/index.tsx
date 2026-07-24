import { getTranslations } from 'next-intl/server';
import { CurrencySummaryCardView } from '@/components/CurrencySummaryCard/CurrencySummaryCardView';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
}

export const CurrencySummaryCard = async ({ currencySummary, locale }: Props) => {
  const t = await getTranslations();

  return <CurrencySummaryCardView currencySummary={currencySummary} locale={locale} t={t} />;
};
