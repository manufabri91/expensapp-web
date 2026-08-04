'use client';

import { useLocale } from 'next-intl';
import LoadingSummary from '@/app/dashboard/components/Summary/loading';
import { useFilteredTotals } from '@/app/transactions/components/FilteredTotalsSummary/useFilteredTotals';
import { CurrencySummaryCardClient } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  fallbackTotals?: CurrencySummaryResponse[];
}

export const FilteredTotalsCards = ({ fallbackTotals }: Props) => {
  const { filters } = useTransactionsFilters();
  const { data, isLoading } = useFilteredTotals(filters, fallbackTotals);
  const locale = useLocale();

  if (isLoading) {
    return <LoadingSummary />;
  }

  return (
    <div className="flex h-min flex-col justify-center gap-4 md:flex">
      {(data ?? []).map((currencySummary) => (
        <CurrencySummaryCardClient
          key={currencySummary.currency}
          currencySummary={currencySummary}
          locale={locale}
          variant="periodTotal"
        />
      ))}
    </div>
  );
};
