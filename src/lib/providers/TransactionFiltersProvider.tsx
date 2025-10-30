'use client';

import { endOfMonth, startOfMonth } from 'date-fns';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

interface TransactionsFiltersContextProps {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  patchFilters: (filters: Partial<TransactionFilters>) => void;
}

const date = new Date();
const defaultFilters: TransactionFilters = {
  fromDate: startOfMonth(new Date(date.getFullYear(), date.getMonth())),
  toDate: endOfMonth(new Date(date.getFullYear(), date.getMonth())),
  currentPage: 1,
  totalPages: 1,
  size: 10,
  sortBy: 'eventDate',
  ascending: false,
};
const TransactionsFiltersContext = createContext<TransactionsFiltersContextProps>({
  filters: defaultFilters,
  setFilters: () => {},
  patchFilters: () => {},
});

const useTransactionsFilters = (): TransactionsFiltersContextProps => {
  const context = useContext(TransactionsFiltersContext);
  if (!context) {
    throw new Error('useTransactionsFilters must be used within a TransactionsFiltersProvider');
  }
  return context;
};

const TransactionsFiltersProvider: React.FC<{
  children: ReactNode;
  initialFilters?: Partial<TransactionFilters>;
}> = ({ children, initialFilters }) => {
  const [filters, setFilters] = useState<TransactionFilters>({ ...initialFilters, ...defaultFilters });

  const patchFilters = useMemo(
    () => (filters: Partial<TransactionFilters>) => {
      setFilters((prev) => ({ ...prev, ...filters }));
    },
    [setFilters]
  );

  const value = useMemo(() => ({ filters, setFilters, patchFilters }), [filters, setFilters, patchFilters]);

  return <TransactionsFiltersContext.Provider value={value}>{children}</TransactionsFiltersContext.Provider>;
};

export { useTransactionsFilters, TransactionsFiltersProvider };
