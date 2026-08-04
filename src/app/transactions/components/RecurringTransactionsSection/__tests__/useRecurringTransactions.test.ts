import useSWR from 'swr';
import { useRecurringTransactions } from '@/app/transactions/components/RecurringTransactionsSection/useRecurringTransactions';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('swr');
jest.mock('@/lib/actions/recurringTransactions', () => ({ getRecurringTransactions: jest.fn() }));

const mockedUseSWR = useSWR as jest.Mock;

describe('useRecurringTransactions', () => {
  beforeEach(() => {
    mockedUseSWR.mockReturnValue({ data: undefined, isLoading: true, mutate: jest.fn() });
  });

  it('keys SWR off the recurring-transaction cache key and uses getRecurringTransactions as the fetcher', () => {
    useRecurringTransactions();

    const [key, fetcher] = mockedUseSWR.mock.calls[0];
    expect(key).toBe('/api/recurring-transaction');
    expect(fetcher).toBe(getRecurringTransactions);
  });

  it('forwards initialData as SWR fallbackData', () => {
    const initialData: RecurringTransactionResponse[] = [buildRecurrence()];

    useRecurringTransactions(initialData);

    const [, , options] = mockedUseSWR.mock.calls[0];
    expect(options).toMatchObject({ fallbackData: initialData });
  });
});
