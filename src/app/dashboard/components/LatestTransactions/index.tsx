import { TransactionsTable } from '@/components';
import { getTransactionsByMonthAndYear } from '@/lib/actions/transactions';

export const LatestTransactions = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const transactions = await getTransactionsByMonthAndYear(currentMonth, currentYear);
  return (
    <div className="mt-4">
      <TransactionsTable transactions={transactions} />
    </div>
  );
};
