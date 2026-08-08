import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { getProgrammedTransactions } from '@/lib/actions/summaries';
import { ProgrammedTransactionsSection } from './index';

export const ProgrammedTransactionsSectionServer = async () => {
  // Both lists are prefetched here: the recurring one hydrates the id→recurrence map the section
  // needs to render a recurring row's action buttons, so those buttons are present on first paint
  // instead of popping in after a client-side fetch.
  const [initialProgrammedTransactions, initialRecurrences] = await Promise.all([
    getProgrammedTransactions(),
    getRecurringTransactions(),
  ]);

  return (
    <ProgrammedTransactionsSection
      initialProgrammedTransactions={initialProgrammedTransactions}
      initialRecurrences={initialRecurrences}
    />
  );
};
