/**
 * @jest-environment node
 */
import { getDashboardSummaryData } from '@/app/dashboard/components/Summary/getDashboardSummaryData';
import { getAccounts } from '@/lib/actions/accounts';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { getMonthlyHistory, getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('@/lib/actions/accounts', () => ({ getAccounts: jest.fn() }));
jest.mock('@/lib/actions/recurringTransactions', () => ({ getRecurringTransactions: jest.fn() }));
jest.mock('@/lib/actions/summaries', () => ({
  getMonthSummary: jest.fn(),
  getTotalsByCategory: jest.fn(),
  getMonthlyHistory: jest.fn(),
}));

const mockedGetAccounts = getAccounts as jest.Mock;
const mockedGetRecurringTransactions = getRecurringTransactions as jest.Mock;
const mockedGetMonthSummary = getMonthSummary as jest.Mock;
const mockedGetTotalsByCategory = getTotalsByCategory as jest.Mock;
const mockedGetMonthlyHistory = getMonthlyHistory as jest.Mock;

const REFERENCE_DATE = new Date('2024-06-10T12:00:00.000Z');

describe('getDashboardSummaryData', () => {
  beforeEach(() => {
    mockedGetAccounts.mockResolvedValue([{ id: 1, name: 'Checking', currency: 'USD', accountBalance: 0, initialBalance: 0 }]);
    mockedGetRecurringTransactions.mockResolvedValue([]);
    mockedGetMonthSummary.mockResolvedValue([{ currency: 'USD', totalBalance: 100, incomes: 200, expenses: 100 }]);
    mockedGetTotalsByCategory.mockResolvedValue([
      { id: 1, name: 'Subscriptions', color: '#fff', totals: { USD: -9.99 }, subTotalsPerSubCategory: [] },
    ]);
    mockedGetMonthlyHistory.mockResolvedValue([{ year: 2024, month: 6, currency: 'USD', incomes: 200, expenses: 100 }]);
  });

  it('fetches every read in parallel and returns them unchanged', async () => {
    const data = await getDashboardSummaryData(REFERENCE_DATE);

    expect(data.summaries).toEqual(await mockedGetMonthSummary.mock.results[0].value);
    expect(data.categorySummaries).toEqual(await mockedGetTotalsByCategory.mock.results[0].value);
    expect(data.monthlyHistory).toEqual(await mockedGetMonthlyHistory.mock.results[0].value);
    expect(mockedGetTotalsByCategory).toHaveBeenCalledWith(2024, 6);
    expect(mockedGetMonthlyHistory).toHaveBeenCalledWith(6);
  });

  it('derives category and history currencies present in the fetched summaries', async () => {
    const data = await getDashboardSummaryData(REFERENCE_DATE);

    expect(data.categoryCurrencies).toEqual(['USD']);
    expect(data.historyCurrencies).toEqual(['USD']);
  });

  it('excludes currencies not present in the allowed list', async () => {
    mockedGetTotalsByCategory.mockResolvedValue([
      { id: 1, name: 'Subscriptions', color: '#fff', totals: { GBP: -9.99 }, subTotalsPerSubCategory: [] },
    ]);

    const data = await getDashboardSummaryData(REFERENCE_DATE);

    expect(data.categoryCurrencies).toEqual([]);
  });

  it('groups upcoming recurring transactions into expenses and incomes', async () => {
    mockedGetRecurringTransactions.mockResolvedValue([
      buildRecurrence({
        id: 1,
        type: TransactionType.EXPENSE,
        status: RecurrenceStatus.ACTIVE,
        accountId: 1,
        nextDueDate: '2024-06-15T00:00:00.000Z',
      }),
      buildRecurrence({
        id: 2,
        type: TransactionType.INCOME,
        status: RecurrenceStatus.ACTIVE,
        accountId: 1,
        nextDueDate: '2024-06-20T00:00:00.000Z',
      }),
    ]);

    const data = await getDashboardSummaryData(REFERENCE_DATE);

    expect(data.upcomingExpenses).toHaveLength(1);
    expect(data.upcomingIncomes).toHaveLength(1);
  });
});
