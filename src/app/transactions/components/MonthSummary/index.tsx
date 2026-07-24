import { FilteredTotalsSwitch } from '@/app/transactions/components/FilteredTotalsSummary';
import { CurrencyCardsSection } from '@/app/transactions/components/MonthSummary/CurrencyCardsSection';

interface Props {
  year: number;
  month: number;
}

export const MonthSummary = async ({ year, month }: Props) => {
  return (
    <div className="mb-4 flex flex-col justify-center gap-4 md:flex-row">
      <FilteredTotalsSwitch>
        <CurrencyCardsSection year={year} month={month} />
      </FilteredTotalsSwitch>
    </div>
  );
};
