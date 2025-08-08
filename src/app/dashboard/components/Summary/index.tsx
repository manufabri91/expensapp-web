import { HiArrowTrendingDown, HiArrowTrendingUp, HiEquals } from 'react-icons/hi2';
import { Card, HR } from 'flowbite-react';
import { code } from 'currency-codes';
import { Money } from '@/components';
import { CategorySummaryResponse, CurrencySummaryResponse } from '@/types/dto';
import { getMonthSummary, getTotalsByCategory } from '@/lib/actions/summaries';

const TrendIcon = ({ amount }: { amount: number }) => {
  if (amount < 0) {
    return <HiArrowTrendingDown className="text-2xl font-bold text-red-600" />;
  }
  if (amount > 0) {
    return <HiArrowTrendingUp className="text-2xl font-bold text-green-600" />;
  }
  return <HiEquals className="text-2xl font-bold text-amber-600 dark:text-amber-300" />;
};

export const Summary = async () => {
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
              <div className="flex flex-col items-center justify-between">
                <h3 className="text-nowrap text-lg font-semibold">
                  Balance in {code(currencySummary.currency)?.currency}
                </h3>
                <Money
                  amount={currencySummary.totalBalance}
                  currency={currencySummary.currency}
                  className="text-2xl font-bold"
                  warnIfZero
                />
                <TrendIcon amount={currencySummary.incomes + currencySummary.expenses} />
              </div>
              <div className="relative">
                <HR className="my-0" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="mr-1">Incomes:</span>
                  <Money amount={currencySummary.incomes} currency={currencySummary.currency} className="text-base" />
                </div>
                <div className="flex justify-between">
                  <span className="mr-1">Expenses:</span>
                  <Money amount={currencySummary.expenses} currency={currencySummary.currency} className="text-base" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      {categorySummaries.length > 0 && (
        <div className="h-full">
          <h3 className="mb-4 mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">
            Expenses per Category
          </h3>
          <div>
            <div className="flex h-full flex-col justify-start gap-4">
              <div className="col-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {categorySummaries.map((categorySummary) => (
                  <Card key={categorySummary.id}>
                    <div className="flex h-full flex-col justify-start">
                      <div className="flex items-start justify-between">
                        <span className="text-nowrap text-lg font-semibold">{categorySummary.name}</span>

                        <div className="flex flex-col items-end">
                          {Object.entries(categorySummary.totals).map(([currency, total]) => (
                            <Money
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
                            <span>{subCategory.name}</span>
                            <div className="flex flex-col items-end">
                              {Object.entries(subCategory.subtotals).map(([currency, subtotal]) => (
                                <Money key={currency} amount={subtotal} currency={currency} className="text-base" />
                              ))}
                            </div>
                          </div>
                          {idx < categorySummary.subTotalsPerSubCategory.length - 1 && (
                            <HR className="my-2 opacity-40" />
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
