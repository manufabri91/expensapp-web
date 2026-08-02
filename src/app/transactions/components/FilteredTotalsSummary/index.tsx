'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { FilteredTotalsCards } from '@/app/transactions/components/FilteredTotalsSummary/FilteredTotalsCards';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { getYearMonthFromParams } from '@/lib/utils/date';
import { hasActiveChipFilters, isCustomDateRange } from '@/types/viewModel/transactionFilters';

interface Props {
  children: ReactNode;
}

export const FilteredTotalsSwitch = ({ children }: Props) => {
  const { filters } = useTransactionsFilters();
  const searchParams = useSearchParams();
  const { year, month } = getYearMonthFromParams(searchParams.get('year'), searchParams.get('month'));

  const showFilteredTotals = hasActiveChipFilters(filters) || isCustomDateRange(filters, year, month);

  return showFilteredTotals ? <FilteredTotalsCards /> : <>{children}</>;
};
