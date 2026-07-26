'use client';

import { memo, ReactNode, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface MonthPoint {
  label: string;
  incomes: number;
  expenses: number;
}

interface Props {
  chartData: MonthPoint[];
  currency: string;
  locale: string;
  renderTooltip: (point: MonthPoint) => ReactNode;
}

export const INCOME_COLOR = 'var(--success)';
export const EXPENSE_COLOR = 'var(--danger)';

export const BalanceAreaChart = memo(({ chartData, currency, locale, renderTooltip }: Props) => {
  const incomeGradientId = `incomeGradient-${currency}`;
  const expenseGradientId = `expenseGradient-${currency}`;
  const currencyTickFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [locale, currency]
  );

  return (
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

          <CartesianGrid vertical={false} className="stroke-default-soft-hover" />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            dy={5}
            tick={{ className: 'fill-foreground-soft font-sans text-sm' }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => currencyTickFormatter.format(value)}
            tick={{ className: 'fill-foreground-soft font-sans text-sm' }}
          />

          <Tooltip
            cursor={{ className: 'stroke-divider', strokeWidth: 1.5 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return renderTooltip(payload[0].payload as MonthPoint);
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
  );
});

BalanceAreaChart.displayName = 'BalanceAreaChart';
