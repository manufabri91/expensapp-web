import { TransactionsTable } from '@/components';
import { getTransactions, getTransactionsByMonthAndYear } from '@/lib/actions/transactions';

export const LatestTransactions = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const transactions = await getTransactions(currentMonth, currentYear);
  return (
    <div className="mt-4">
      <TransactionsTable transactions={transactions} />
    </div>
  );
};
