/**
 * @jest-environment node
 */
import { getDashboardSummaryData } from '@/app/dashboard/components/Summary/getDashboardSummaryData';
import {
  getMonthlyHistory,
  getMonthSummary,
  getTotalsByCategory,
  getUpcomingTransactions,
} from '@/lib/actions/summaries';

jest.mock('@/lib/actions/summaries', () => ({
  getMonthSummary: jest.fn(),
  getTotalsByCategory: jest.fn(),
  getMonthlyHistory: jest.fn(),
  getUpcomingTransactions: jest.fn(),
}));

const mockedGetMonthSummary = getMonthSummary as jest.Mock;
const mockedGetTotalsByCategory = getTotalsByCategory as jest.Mock;
const mockedGetMonthlyHistory = getMonthlyHistory as jest.Mock;
const mockedGetUpcomingTransactions = getUpcomingTransactions as jest.Mock;

const REFERENCE_DATE = new Date('2024-06-10T12:00:00.000Z');

describe('getDashboardSummaryData', () => {
  beforeEach(() => {
    mockedGetMonthSummary.mockResolvedValue([{ currency: 'USD', totalBalance: 100, incomes: 200, expenses: 100 }]);
    mockedGetTotalsByCategory.mockResolvedValue([
      { id: 1, name: 'Subscriptions', color: '#fff', totals: { USD: -9.99 }, subTotalsPerSubCategory: [] },
    ]);
    mockedGetMonthlyHistory.mockResolvedValue([{ year: 2024, month: 6, currency: 'USD', incomes: 200, expenses: 100 }]);
    mockedGetUpcomingTransactions.mockResolvedValue({ expenses: [], incomes: [] });
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

  it('passes the upcoming transactions endpoint groups through as expenses and incomes', async () => {
    const expenses = [{ currency: 'USD', total: -9.99, items: [] }];
    const incomes = [{ currency: 'USD', total: 200, items: [] }];
    mockedGetUpcomingTransactions.mockResolvedValue({ expenses, incomes });

    const data = await getDashboardSummaryData(REFERENCE_DATE);

    expect(data.upcomingExpenses).toBe(expenses);
    expect(data.upcomingIncomes).toBe(incomes);
  });
});
