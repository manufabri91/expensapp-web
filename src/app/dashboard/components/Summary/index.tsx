import { getLocale, getTranslations } from 'next-intl/server';
import { CurrencySummaryCard } from '@/components';
import { ALLOWED_CURRENCIES } from '@/constants';
import { getAccounts } from '@/lib/actions/accounts';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { getMonthlyHistory, getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { CategorySummaryResponse, CurrencySummaryResponse, MonthlyBalanceSummaryResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';
import { groupUpcomingRecurringTransactions } from '@/utils/upcomingRecurringTransactions';
import CategoriesSummaryPie from './CategoriesSummaryPie';
import RecentMonthsBalanceChart from './RecentMonthsBalanceChart';
import { UpcomingRecurringCard } from './UpcomingRecurringCard';

const currenciesPresentIn = (currencies: Iterable<string>) => {
  const present = new Set(currencies);
  return ALLOWED_CURRENCIES.filter((currency) => present.has(currency));
};

export const Summary = async () => {
  const locale = await getLocale();
  const t = await getTranslations('Dashboard.summary.upcoming');
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const summaries: CurrencySummaryResponse[] = await getMonthSummary();
  const categorySummaries: CategorySummaryResponse[] = await getTotalsByCategory(year, month);
  const monthlyHistory: MonthlyBalanceSummaryResponse[] = await getMonthlyHistory(6);
  const recurringTransactions = await getRecurringTransactions();
  const accounts = await getAccounts();

  const categoryCurrencies = currenciesPresentIn(categorySummaries.flatMap((category) => Object.keys(category.totals)));
  const historyCurrencies = currenciesPresentIn(monthlyHistory.map((entry) => entry.currency));
  const upcomingExpenses = groupUpcomingRecurringTransactions(
    recurringTransactions,
    accounts,
    TransactionType.EXPENSE,
    date
  );
  const upcomingIncomes = groupUpcomingRecurringTransactions(
    recurringTransactions,
    accounts,
    TransactionType.INCOME,
    date
  );

  return (
    <>
      <div className="mb-4 flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="flex h-min flex-col justify-center gap-4">
          {summaries.map((currencySummary) => (
            <CurrencySummaryCard key={currencySummary.currency} currencySummary={currencySummary} locale={locale} />
          ))}

          {(upcomingExpenses.length > 0 || upcomingIncomes.length > 0) && (
            <div className="flex flex-col gap-4">
              {upcomingExpenses.map((group) => (
                <UpcomingRecurringCard
                  key={`expenses-${group.currency}`}
                  title={t('expenses.title')}
                  currency={group.currency}
                  total={group.total}
                  items={group.items}
                />
              ))}
              {upcomingIncomes.map((group) => (
                <UpcomingRecurringCard
                  key={`incomes-${group.currency}`}
                  title={t('incomes.title')}
                  currency={group.currency}
                  total={group.total}
                  items={group.items}
                />
              ))}
            </div>
          )}
        </div>
        {historyCurrencies.length > 0 && (
          <>
            {historyCurrencies.map((currency) => (
              <RecentMonthsBalanceChart key={currency} data={monthlyHistory} currency={currency} locale={locale} />
            ))}
          </>
        )}
        {categoryCurrencies.length > 0 &&
          categoryCurrencies.map((currency) => (
            <CategoriesSummaryPie
              key={currency}
              categorySummaries={categorySummaries}
              currency={currency}
              locale={locale}
            />
          ))}
      </div>
    </>
  );
};
