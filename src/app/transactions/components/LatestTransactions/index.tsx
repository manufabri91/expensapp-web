'use client';

import { TransactionsTable } from '@/components';

export const LatestTransactions = () => {
  return (
    <div className="mt-4 md:mt-8">
      <TransactionsTable noTransactionsMessage="No transactions this month" showPagination />
    </div>
  );
};
