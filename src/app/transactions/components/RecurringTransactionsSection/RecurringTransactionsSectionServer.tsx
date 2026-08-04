import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionsSection } from './index';

export const RecurringTransactionsSectionServer = async () => {
  const initialRecurrences = await getRecurringTransactions();

  return <RecurringTransactionsSection initialRecurrences={initialRecurrences} />;
};
