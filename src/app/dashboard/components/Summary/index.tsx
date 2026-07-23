import { Card, Separator } from '@heroui/react';
import { getLocale, getTranslations } from 'next-intl/server';
import { HiArrowTrendingDown, HiArrowTrendingUp, HiEquals } from 'react-icons/hi2';
import { Money } from '@/components';
import { ALLOWED_CURRENCIES } from '@/constants';
import { getMonthlyHistory, getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { CategorySummaryResponse, CurrencySummaryResponse, MonthlyBalanceSummaryResponse } from '@/types/dto';
import CategoriesSummaryPie from './CategoriesSummaryPie';
import RecentMonthsBalanceChart from './RecentMonthsBalanceChart';

const currenciesPresentIn = (currencies: Iterable<string>) => {
  const present = new Set(currencies);
  return ALLOWED_CURRENCIES.filter((currency) => present.has(currency));
};

const TrendIcon = ({ amount }: { amount: number }) => {
  if (amount < 0) {
    return <HiArrowTrendingDown className="text-xl font-bold text-red-600" />;
  }
  if (amount > 0) {
    return <HiArrowTrendingUp className="text-xl font-bold text-emerald-600 dark:text-emerald-500" />;
  }
  return <HiEquals className="text-xl font-bold text-amber-600 dark:text-amber-300" />;
};

export const Summary = async () => {
  const t = await getTranslations();
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
            <Card key={currencySummary.currency} className="md:min-w-[300px]">
              <Card.Content>
                <div className="flex h-fit w-fit flex-col items-center justify-between self-center">
                  <h3 className="text-lg font-semibold text-nowrap">
                    {t('Dashboard.summary.balance.current.title', {
                      currencyCode: t(`Generics.currencies.${currencySummary.currency}.plural`),
                    })}
                  </h3>
                  <div className="mt-2 w-fit justify-items-center">
                    <Money
                      locale={locale}
                      amount={currencySummary.totalBalance}
                      currency={currencySummary.currency}
                      className="h-min overflow-hidden text-2xl font-bold"
                      warnIfZero
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Money
                        locale={locale}
                        amount={currencySummary.incomes + currencySummary.expenses}
                        className="overflow-hidden text-sm font-medium"
                        warnIfZero
                      />
                      <TrendIcon amount={currencySummary.incomes + currencySummary.expenses} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Separator className="my-3" />
                </div>
                <div className="mt-1 flex flex-col">
                  <div className="flex justify-between">
                    <span className="mr-1">{t('Generics.income.plural')}:</span>
                    <Money
                      amount={currencySummary.incomes}
                      currency={currencySummary.currency}
                      locale={locale}
                      className="overflow-hidden text-base"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="mr-1">{t('Generics.expense.plural')}:</span>
                    <Money
                      amount={currencySummary.expenses}
                      currency={currencySummary.currency}
                      locale={locale}
                      className="overflow-hidden text-base"
                    />
                  </div>
                </div>
              </Card.Content>
            </Card>
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
