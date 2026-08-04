import { ALLOWED_CURRENCIES } from '@/constants';
import { getAccounts } from '@/lib/actions/accounts';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { getMonthlyHistory, getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { CategorySummaryResponse, CurrencySummaryResponse, MonthlyBalanceSummaryResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';
import { groupUpcomingRecurringTransactions, UpcomingRecurringGroup } from '@/utils/upcomingRecurringTransactions';

export interface DashboardSummaryData {
  summaries: CurrencySummaryResponse[];
  categorySummaries: CategorySummaryResponse[];
  monthlyHistory: MonthlyBalanceSummaryResponse[];
  categoryCurrencies: string[];
  historyCurrencies: string[];
  upcomingExpenses: UpcomingRecurringGroup[];
  upcomingIncomes: UpcomingRecurringGroup[];
}

const currenciesPresentIn = (currencies: Iterable<string>): string[] => {
  const present = new Set(currencies);
  return ALLOWED_CURRENCIES.filter((currency) => present.has(currency));
};

export const getDashboardSummaryData = async (referenceDate: Date): Promise<DashboardSummaryData> => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;

  const [summaries, categorySummaries, monthlyHistory, recurringTransactions, accounts] = await Promise.all([
    getMonthSummary(),
    getTotalsByCategory(year, month),
    getMonthlyHistory(6),
    getRecurringTransactions(),
    getAccounts(),
  ]);

  return {
    summaries,
    categorySummaries,
    monthlyHistory,
    categoryCurrencies: currenciesPresentIn(categorySummaries.flatMap((category) => Object.keys(category.totals))),
    historyCurrencies: currenciesPresentIn(monthlyHistory.map((entry) => entry.currency)),
    upcomingExpenses: groupUpcomingRecurringTransactions(
      recurringTransactions,
      accounts,
      TransactionType.EXPENSE,
      referenceDate
    ),
    upcomingIncomes: groupUpcomingRecurringTransactions(
      recurringTransactions,
      accounts,
      TransactionType.INCOME,
      referenceDate
    ),
  };
};
