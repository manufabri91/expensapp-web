'use client';

import { ListSkeleton, TransactionsTable } from '@/components';
import { getTransactionsByMonthAndYear } from '@/lib/actions/transactions';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { TransactionResponse } from '@/types/dto';
import { useEffect, useState } from 'react';

export const LatestTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { filters } = useTransactionsFilters();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const transactions = await getTransactionsByMonthAndYear(
        filters.month,
        filters.year,
        filters.currentPage,
        filters.pageSize
      );
      setTransactions(transactions);
      setLoading(false);
    };
    fetchTransactions();
  }, [filters]);

  return (
    <div className="mt-4 overflow-x-auto">
      {loading && <ListSkeleton rows={3} />}
      {!loading && (
        <>
          <TransactionsTable transactions={transactions} showPagination />
        </>
      )}
    </div>
  );
};
