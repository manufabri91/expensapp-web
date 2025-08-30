import { HiArrowTrendingDown, HiArrowTrendingUp, HiEquals } from 'react-icons/hi2';
import { Card, HR } from 'flowbite-react';
import { Money } from '@/components';
import { CategorySummaryResponse, CurrencySummaryResponse } from '@/types/dto';
import { getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';
import { getLocale, getTranslations } from 'next-intl/server';
import { SYSTEM_TRANSLATION_KEYS } from '@/constants';

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

  return (
    <>
      <div>
        <div className="flex w-full flex-col justify-center gap-4 md:flex md:flex-row md:flex-wrap">
          {summaries.map((currencySummary) => (
            <Card key={currencySummary.currency} className="md:min-w-[300px]">
              <div className="flex w-fit flex-col items-center justify-between self-center">
                <h3 className="text-nowrap text-lg font-semibold">
                  {t('Dashboard.summary.balance.title', {
                    currencyCode: t(`Generics.currencies.${currencySummary.currency}.plural`),
                  })}
                </h3>
                <div className="w-fit">
                  <Money
                    locale={locale}
                    amount={currencySummary.totalBalance}
                    currency={currencySummary.currency}
                    className="text-2xl font-bold"
                    warnIfZero
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Money
                      locale={locale}
                      amount={currencySummary.incomes + currencySummary.expenses}
                      className="text-sm font-medium"
                      warnIfZero
                    />
                    <TrendIcon amount={currencySummary.incomes + currencySummary.expenses} />
                  </div>
                </div>
              </div>
              <div className="relative">
                <HR className="my-0" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="mr-1">{t('Generics.income.plural')}:</span>
                  <Money
                    amount={currencySummary.incomes}
                    currency={currencySummary.currency}
                    locale={locale}
                    className="text-base"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="mr-1">{t('Generics.expense.plural')}:</span>
                  <Money
                    amount={currencySummary.expenses}
                    currency={currencySummary.currency}
                    locale={locale}
                    className="text-base"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {categorySummaries.length > 0 && (
        <div className="h-full">
          <h3 className="mb-4 mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">
            {t('Dashboard.summary.totalsPerCategory.title')}
          </h3>
          <div>
            <div className="col-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {categorySummaries.map((categorySummary) => (
                <Card key={categorySummary.id}>
                  <div className="flex h-full flex-col justify-start">
                    <div className="flex items-baseline justify-between">
                      <span className="text-nowrap text-lg font-semibold">{categorySummary.name}</span>

                      <div className="flex flex-col items-end">
                        {Object.entries(categorySummary.totals).map(([currency, total]) => (
                          <Money
                            locale={locale}
                            key={currency}
                            amount={total}
                            currency={currency}
                            className="text-base font-semibold"
                          />
                        ))}
                      </div>
                    </div>
                    <HR className="my-3" />
                    {categorySummary.subTotalsPerSubCategory.map((subCategory, idx) => (
                      <div key={subCategory.id}>
                        <div className="mb-1 flex items-start justify-between">
                          <span>
                            {SYSTEM_TRANSLATION_KEYS.includes(subCategory.name)
                              ? t(`System.${subCategory.name}`)
                              : subCategory.name}
                          </span>
                          <div className="flex flex-col items-end">
                            {Object.entries(subCategory.subtotals).map(([currency, subtotal]) => (
                              <Money
                                key={currency}
                                amount={subtotal}
                                currency={currency}
                                locale={locale}
                                className="text-base"
                              />
                            ))}
                          </div>
                        </div>
                        {idx < categorySummary.subTotalsPerSubCategory.length - 1 && <HR className="my-2 opacity-40" />}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
