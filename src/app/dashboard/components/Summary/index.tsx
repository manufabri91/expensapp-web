import { getLocale, getTranslations } from 'next-intl/server';
import { CurrencySummaryCard } from '@/components';
import CategoriesSummaryPie from './CategoriesSummaryPie';
import { getDashboardSummaryData } from './getDashboardSummaryData';
import RecentMonthsBalanceChart from './RecentMonthsBalanceChart';
import { UpcomingRecurringCard } from './UpcomingRecurringCard';

export const Summary = async () => {
  const locale = await getLocale();
  const t = await getTranslations('Dashboard.summary.upcoming');
  const {
    summaries,
    categorySummaries,
    monthlyHistory,
    categoryCurrencies,
    historyCurrencies,
    upcomingExpenses,
    upcomingIncomes,
  } = await getDashboardSummaryData(new Date());

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
