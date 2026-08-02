import { getTranslations } from 'next-intl/server';
import { CurrencySummaryCardView } from '@/components/CurrencySummaryCard/CurrencySummaryCardView';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
  variant?: 'accountBalance' | 'periodTotal';
}

export const CurrencySummaryCard = async ({ currencySummary, locale, variant }: Props) => {
  const t = await getTranslations();

  return <CurrencySummaryCardView currencySummary={currencySummary} locale={locale} t={t} variant={variant} />;
};
