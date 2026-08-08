import { ALLOWED_CURRENCIES } from '@/constants';
import {
  getMonthlyHistory,
  getMonthSummary,
  getTotalsByCategory,
  getUpcomingTransactions,
} from '@/lib/actions/summaries';
import {
  CategorySummaryResponse,
  CurrencySummaryResponse,
  MonthlyBalanceSummaryResponse,
  UpcomingTransactionGroup,
} from '@/types/dto';

export interface DashboardSummaryData {
  summaries: CurrencySummaryResponse[];
  categorySummaries: CategorySummaryResponse[];
  monthlyHistory: MonthlyBalanceSummaryResponse[];
  categoryCurrencies: string[];
  historyCurrencies: string[];
  upcomingExpenses: UpcomingTransactionGroup[];
  upcomingIncomes: UpcomingTransactionGroup[];
}

const currenciesPresentIn = (currencies: Iterable<string>): string[] => {
  const present = new Set(currencies);
  return ALLOWED_CURRENCIES.filter((currency) => present.has(currency));
};

export const getDashboardSummaryData = async (referenceDate: Date): Promise<DashboardSummaryData> => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;

  const [summaries, categorySummaries, monthlyHistory, upcomingTransactions] = await Promise.all([
    getMonthSummary(),
    getTotalsByCategory(year, month),
    getMonthlyHistory(6),
    getUpcomingTransactions(),
  ]);

  return {
    summaries,
    categorySummaries,
    monthlyHistory,
    categoryCurrencies: currenciesPresentIn(categorySummaries.flatMap((category) => Object.keys(category.totals))),
    historyCurrencies: currenciesPresentIn(monthlyHistory.map((entry) => entry.currency)),
    upcomingExpenses: upcomingTransactions.expenses,
    upcomingIncomes: upcomingTransactions.incomes,
  };
};
