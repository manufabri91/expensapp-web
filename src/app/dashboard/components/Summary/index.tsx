import { getLocale } from 'next-intl/server';
import { CurrencySummaryCard } from '@/components';
import { ALLOWED_CURRENCIES } from '@/constants';
import { getMonthlyHistory, getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { CategorySummaryResponse, CurrencySummaryResponse, MonthlyBalanceSummaryResponse } from '@/types/dto';
import CategoriesSummaryPie from './CategoriesSummaryPie';
import RecentMonthsBalanceChart from './RecentMonthsBalanceChart';

const currenciesPresentIn = (currencies: Iterable<string>) => {
  const present = new Set(currencies);
  return ALLOWED_CURRENCIES.filter((currency) => present.has(currency));
};

export const Summary = async () => {
  const locale = await getLocale();
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const summaries: CurrencySummaryResponse[] = await getMonthSummary();
  const categorySummaries: CategorySummaryResponse[] = await getTotalsByCategory(year, month);
  const monthlyHistory: MonthlyBalanceSummaryResponse[] = await getMonthlyHistory(6);

  const categoryCurrencies = currenciesPresentIn(categorySummaries.flatMap((category) => Object.keys(category.totals)));
  const historyCurrencies = currenciesPresentIn(monthlyHistory.map((entry) => entry.currency));

  return (
    <>
      <div className="mb-4 flex flex-col justify-center gap-4 md:flex-row">
        <div className="flex h-min flex-col justify-center gap-4 md:flex">
          {summaries.map((currencySummary) => (
            <CurrencySummaryCard key={currencySummary.currency} currencySummary={currencySummary} locale={locale} />
          ))}
          {historyCurrencies.length > 0 && (
            <>
              {historyCurrencies.map((currency) => (
                <RecentMonthsBalanceChart key={currency} data={monthlyHistory} currency={currency} locale={locale} />
              ))}
            </>
          )}
        </div>
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
