import { getLocale } from 'next-intl/server';
import { CurrencySummaryCard } from '@/components';
import { getMonthSummary } from '@/lib/actions/summaries';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  year: number;
  month: number;
}

export const CurrencyCardsSection = async ({ year, month }: Props) => {
  const locale = await getLocale();
  const summaries: CurrencySummaryResponse[] = await getMonthSummary(year, month);

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
