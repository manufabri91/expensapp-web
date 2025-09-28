'use client';

import { TransactionsTable } from '@/components';

export const LatestTransactions = () => {
  return (
    <div className="mt-4 overflow-x-auto">
      <TransactionsTable showPagination />
    </div>
  );
};
