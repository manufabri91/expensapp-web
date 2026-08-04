import { FilteredTotalsSwitch } from '@/app/transactions/components/FilteredTotalsSummary';
import { CurrencyCardsSection } from '@/app/transactions/components/MonthSummary/CurrencyCardsSection';
import { getMonthSummary } from '@/lib/actions/summaries';

interface Props {
  year: number;
  month: number;
}

export const MonthSummary = async ({ year, month }: Props) => {
  const summaries = await getMonthSummary(year, month);

  return (
    <FilteredTotalsSwitch fallbackTotals={summaries}>
      <CurrencyCardsSection summaries={summaries} />
    </FilteredTotalsSwitch>
  );
};
