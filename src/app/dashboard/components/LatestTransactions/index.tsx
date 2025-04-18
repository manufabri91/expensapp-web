import { TransactionsTable } from '@/components';
import { getTransactions } from '@/lib/actions/transactions';

export const LatestTransactions = async () => {
  const pagedTransactions = await getTransactions();
  return (
    <div className="mt-4 overflow-x-auto">
      <TransactionsTable transactions={pagedTransactions.content} />
    </div>
  );
};
