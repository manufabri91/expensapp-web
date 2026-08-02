import { endOfMonth, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { AccountResponse, RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';

export interface UpcomingRecurringItem {
  recurrence: RecurringTransactionResponse;
  signedAmount: number;
}

export interface UpcomingRecurringGroup {
  currency: string;
  total: number;
  items: UpcomingRecurringItem[];
}

// A recurrence's nextDueDate is always the next occurrence strictly after its last generated one
// (or its start date), so it's inherently "not yet due" - but it isn't guaranteed to fall within
// the current calendar month, and if generation has fallen behind (e.g. the nightly job missed a
// run) it could even be in the past. Both cases are excluded here: only ACTIVE recurrences whose
// nextDueDate is between today and the end of the current month count as "upcoming this month".
export const groupUpcomingRecurringTransactions = (
  recurrences: RecurringTransactionResponse[],
  accounts: AccountResponse[],
  type: TransactionType,
  referenceDate: Date
): UpcomingRecurringGroup[] => {
  const currencyByAccountId = new Map(accounts.map((account) => [account.id, account.currency]));
  const today = startOfDay(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const sign = type === TransactionType.EXPENSE ? -1 : 1;

  const itemsByCurrency = new Map<string, UpcomingRecurringItem[]>();
  recurrences
    .filter((recurrence) => recurrence.type === type && recurrence.status === RecurrenceStatus.ACTIVE)
    .forEach((recurrence) => {
      if (!recurrence.nextDueDate) return;
      const dueDate = parseISO(recurrence.nextDueDate);
      if (isBefore(dueDate, today) || isAfter(dueDate, monthEnd)) return;

      const currency = currencyByAccountId.get(recurrence.accountId);
      if (!currency) return;

      const items = itemsByCurrency.get(currency) ?? [];
      items.push({ recurrence, signedAmount: sign * recurrence.amount });
      itemsByCurrency.set(currency, items);
    });

  return Array.from(itemsByCurrency.entries()).map(([currency, items]) => ({
    currency,
    total: items.reduce((sum, item) => sum + item.signedAmount, 0),
    items: items
      .slice()
      .sort((a, b) => (a.recurrence.nextDueDate ?? '').localeCompare(b.recurrence.nextDueDate ?? '')),
  }));
};
