'use client';

import { TransactionFilters } from '@/types/viewModel/transactionFilters';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface TransactionsFiltersContextProps {
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  patchFilters: (filters: Partial<TransactionFilters>) => void;
}

const date = new Date();
const defaultFilters: TransactionFilters = {
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  currentPage: 1,
  totalPages: 1,
  pageSize: 100,
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
}> = ({ children }) => {
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

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
