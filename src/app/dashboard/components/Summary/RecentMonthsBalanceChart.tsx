'use client';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Money } from '@/components';
import { MonthlyBalanceSummaryResponse } from '@/types/dto';

interface Props {
  data: MonthlyBalanceSummaryResponse[];
  currency: string;
  locale: string;
}

interface MonthPoint {
  label: string;
  incomes: number;
  expenses: number;
}

const MONTHS_TO_SHOW = 6;
const INCOME_COLOR = 'var(--success)';
const EXPENSE_COLOR = 'var(--danger)';

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

  const incomeGradientId = `incomeGradient-${currency}`;
  const expenseGradientId = `expenseGradient-${currency}`;
  const currencyTickFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });

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

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={INCOME_COLOR} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={EXPENSE_COLOR} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="stroke-divider" vertical={false} />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                padding={{ left: 12, right: 12 }}
                className="text-tiny fill-default-400 font-medium"
                dy={10}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={72}
                className="text-tiny fill-default-400 font-medium"
                tickFormatter={(value: number) => currencyTickFormatter.format(value)}
              />

              <Tooltip
                cursor={{ className: 'stroke-divider', strokeWidth: 1.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as MonthPoint;
                    return (
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
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="incomes"
                stroke={INCOME_COLOR}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${incomeGradientId})`}
                activeDot={{ r: 5, className: 'stroke-content1 stroke-2', style: { fill: INCOME_COLOR } }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={EXPENSE_COLOR}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${expenseGradientId})`}
                activeDot={{ r: 5, className: 'stroke-content1 stroke-2', style: { fill: EXPENSE_COLOR } }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
}
