import { HiArrowTrendingDown, HiArrowTrendingUp, HiEquals } from 'react-icons/hi2';
import { Card, HR } from 'flowbite-react';
import { code } from 'currency-codes';
import { Money } from '@/components';
import { CategorySummaryResponse, CurrencySummaryResponse } from '@/types/dto';

const SUMMARY: Array<CurrencySummaryResponse> = [
  {
    currency: 'USD',
    totalBalance: 1000,
    income: 110,
    expenses: 0,
  },
  {
    currency: 'EUR',
    totalBalance: 100,
    income: 920,
    expenses: -1020,
  },
  {
    currency: 'ARS',
    totalBalance: 0,
    income: 0,
    expenses: 0,
  },
  // {
  //   currency: 'CHF',
  //   totalBalance: 0,
  //   income: 0,
  //   expenses: 0,
  // },
];
const CATEGORY_SUMMARY: Array<CategorySummaryResponse> = [
  {
    id: 1,
    name: 'Food',
    total: 100,
    subTotalsPerSubCategory: [
      {
        id: '1',
        name: 'Groceries',
        subtotal: 50,
      },
      {
        id: '2',
        name: 'Restaurants',
        subtotal: 50,
      },
    ],
  },
  {
    id: 2,
    name: 'Transport',
    total: 100,
    subTotalsPerSubCategory: [
      {
        id: '3',
        name: 'Public Transport',
        subtotal: 50,
      },
      {
        id: '4',
        name: 'Taxi',
        subtotal: 50,
      },
    ],
  },
  {
    id: 3,
    name: 'Transport2',
    total: 100,
    subTotalsPerSubCategory: [
      {
        id: '3',
        name: 'Public Transport',
        subtotal: 50,
      },
      {
        id: '4',
        name: 'Taxi',
        subtotal: 50,
      },
    ],
  },
  {
    id: 4,
    name: 'Transport22',
    total: 100,
    subTotalsPerSubCategory: [
      {
        id: '3',
        name: 'Public Transport',
        subtotal: 50,
      },
      {
        id: '4',
        name: 'Taxi',
        subtotal: 50,
      },
    ],
  },
];

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
  const summaries: CurrencySummaryResponse[] = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(SUMMARY);
    }, 1000);
  });
  const categorySummaries: CategorySummaryResponse[] = await new Promise((resolve) => {
    setTimeout(() => {
      resolve(CATEGORY_SUMMARY);
    }, 1000);
  });

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
                <TrendIcon amount={currencySummary.income + currencySummary.expenses} />
              </div>
              <div className="relative">
                <HR className="my-0" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="mr-1">Incomes:</span>
                  <Money amount={currencySummary.income} currency={currencySummary.currency} className="text-base" />
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
      <div className="h-full">
        <h3 className="my-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Expenses per Category</h3>
        <div>
          <div className="flex h-full flex-col justify-start gap-4">
            <div className="col-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categorySummaries.map((categorySummary) => (
                <Card key={categorySummary.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-nowrap text-lg font-semibold">{categorySummary.name}</span>
                    <Money amount={categorySummary.total} currency="EUR" className="text-2xl" />
                  </div>
                  <HR className="my-0" />
                  <div>
                    {categorySummary.subTotalsPerSubCategory.map((subCategory) => (
                      <div key={subCategory.id} className="flex items-center justify-between">
                        <span>{subCategory.name}</span>
                        <Money amount={subCategory.subtotal} currency="EUR" className="text-base" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
