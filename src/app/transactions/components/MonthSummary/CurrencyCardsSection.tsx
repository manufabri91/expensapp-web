import { getLocale } from 'next-intl/server';
import { CurrencySummaryCard } from '@/components';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  summaries: CurrencySummaryResponse[];
}

export const CurrencyCardsSection = async ({ summaries }: Props) => {
  const locale = await getLocale();

  return (
    <div className="flex h-min flex-col justify-center gap-4 md:flex">
      {summaries.map((currencySummary) => (
        <CurrencySummaryCard
          key={currencySummary.currency}
          currencySummary={currencySummary}
          locale={locale}
          variant="periodTotal"
        />
      ))}
    </div>
  );
};
