'use client';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { BalanceAreaChart, EXPENSE_COLOR, INCOME_COLOR, Money, MonthPoint } from '@/components';
import { MonthlyBalanceSummaryResponse } from '@/types/dto';

interface Props {
  data: MonthlyBalanceSummaryResponse[];
  currency: string;
  locale: string;
}

const MONTHS_TO_SHOW = 6;

export default function RecentMonthsBalanceChart({ data, currency, locale }: Props) {
  const t = useTranslations();

  const chartData: MonthPoint[] = useMemo(() => {
    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    const points: MonthPoint[] = [];
    for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const match = data.find((item) => item.year === year && item.month === month && item.currency === currency);
      points.push({
        label: monthFormatter.format(date),
        expenses: Math.abs(match?.expenses ?? 0),
        incomes: match?.incomes ?? 0,
      });
    }
    return points;
  }, [data, currency, locale]);

  const hasData = chartData.some((point) => point.incomes !== 0 || point.expenses !== 0);
  if (!hasData) {
    return null;
  }

  return (
    <Card className="h-min w-full max-w-xl">
      <Card.Content>
        <div className="mb-6 flex w-full items-center justify-between gap-12">
          <h3 className="text-medium font-semibold tracking-tight">
            {t('Dashboard.summary.balance.lastMonths.title', {
              currencyCode: t(`Generics.currencies.${currency}.plural`),
            })}
          </h3>

          <div className="text-tiny flex items-center gap-4 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
              <span className="text-default-600">{t('Generics.income.plural')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
              <span className="text-default-600">{t('Generics.expense.plural')}</span>
            </div>
          </div>
        </div>

        <BalanceAreaChart
          chartData={chartData}
          currency={currency}
          locale={locale}
          renderTooltip={(point) => (
            <div className="bg-background border-divider rounded-medium shadow-medium text-tiny flex min-w-40 flex-col gap-2 border px-3 py-2">
              <div className="text-default-500 border-divider flex items-center justify-between gap-4 border-b pb-1">
                <span className="font-semibold tracking-wider uppercase">{point.label}</span>
                <Money
                  amount={point.incomes - point.expenses}
                  currency={currency}
                  locale={locale}
                  className="text-tiny font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4">
                  <span className="text-default-600 font-medium">{t('Generics.income.plural')}:</span>
                  <Money amount={point.incomes} currency={currency} locale={locale} className="text-tiny" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-default-600 font-medium">{t('Generics.expense.plural')}:</span>
                  <Money amount={-point.expenses} currency={currency} locale={locale} className="text-tiny" />
                </div>
              </div>
            </div>
          )}
        />
      </Card.Content>
    </Card>
  );
}
