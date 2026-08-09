'use client';

import { Card, Switch, Tag, TagGroup } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HiCheck, HiXMark } from 'react-icons/hi2';
import useSWR from 'swr';
import { BalanceAreaChart, EXPENSE_COLOR, INCOME_COLOR, MonthPoint } from '@/components/BalanceAreaChart';
import { Money } from '@/components/Money';
import { getMonthlyHistory } from '@/lib/actions/summaries';
import { MonthlyBalanceSummaryResponse } from '@/types/dto';

interface Props {
  data: MonthlyBalanceSummaryResponse[];
  currency: string;
  locale: string;
}

const DEFAULT_MONTHS = 6;
const RANGE_OPTIONS = [
  { key: '3', months: 3, label: '3M' },
  { key: '6', months: 6, label: '6M' },
  { key: '12', months: 12, label: '1Y' },
];

export default function RecentMonthsBalanceChart({ data, currency, locale }: Props) {
  const t = useTranslations();
  const [months, setMonths] = useState(DEFAULT_MONTHS);
  const [includePending, setIncludePending] = useState(true);

  const matchesServerFetchedState = months === DEFAULT_MONTHS && includePending === true;

  const {
    data: history,
    isValidating,
    mutate,
  } = useSWR(['monthly-history', months, includePending], () => getMonthlyHistory(months, includePending), {
    fallbackData: matchesServerFetchedState ? data : undefined,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (matchesServerFetchedState) {
      mutate(data, { revalidate: false });
    }
  }, [data, matchesServerFetchedState, mutate]);

  const buildChartData = (source: MonthlyBalanceSummaryResponse[], monthsToShow: number): MonthPoint[] => {
    const now = new Date();
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    const points: MonthPoint[] = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const match = source.find((item) => item.year === year && item.month === month && item.currency === currency);
      points.push({
        label: monthFormatter.format(date),
        expenses: Math.abs(match?.expenses ?? 0),
        incomes: match?.incomes ?? 0,
      });
    }
    return points;
  };

  const chartData = useMemo(() => buildChartData(history ?? data, months), [history, data, months, currency, locale]);

  const total = useMemo(() => chartData.reduce((sum, point) => sum + point.incomes - point.expenses, 0), [chartData]);

  const hasData = useMemo(
    () => buildChartData(data, DEFAULT_MONTHS).some((point) => point.incomes !== 0 || point.expenses !== 0),
    [data, currency, locale]
  );

  const renderTooltip = useCallback(
    (point: MonthPoint) => (
      <div className="bg-background border-divider rounded-medium shadow-medium text-tiny flex min-w-40 flex-col gap-2 border px-3 py-2">
        <div className="border-divider flex items-center justify-between gap-4 border-b pb-1 text-sm">
          <span className="font-semibold tracking-wider capitalize">{point.label}</span>
          <Money
            amount={point.incomes - point.expenses}
            currency={currency}
            locale={locale}
            className="font-semibold"
          />
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="font-sm">{t('Generics.income.plural')}:</span>
            <Money amount={point.incomes} currency={currency} locale={locale} className="font-semibold" />
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-sm">{t('Generics.expense.plural')}:</span>
            <Money amount={-point.expenses} currency={currency} locale={locale} className="font-semibold" />
          </div>
        </div>
      </div>
    ),
    [currency, locale, t]
  );

  if (!hasData) {
    return null;
  }

  return (
    <Card className="h-min w-full min-w-xs md:max-w-md">
      <Card.Header>
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-4">
            <Card.Title>
              {t('Dashboard.summary.balance.lastMonths.title', {
                months,
                currencyCode: t(`Generics.currencies.${currency}.plural`),
              })}
            </Card.Title>
            <TagGroup
              aria-label="range"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={new Set([String(months)])}
              onSelectionChange={(keys) => {
                if (keys === 'all') return;
                const key = Array.from(keys)[0];
                const option = RANGE_OPTIONS.find((range) => range.key === key);
                if (option) setMonths(option.months);
              }}
            >
              <TagGroup.List>
                {RANGE_OPTIONS.map((option) => (
                  <Tag key={option.key} id={option.key}>
                    {option.label}
                  </Tag>
                ))}
              </TagGroup.List>
            </TagGroup>
          </div>
          <div className="flex justify-end">
            <Switch size="sm" isSelected={includePending} onChange={(selected: boolean) => setIncludePending(selected)}>
              <Switch.Content>
                <span className="text-xs">{t('Dashboard.summary.balance.lastMonths.includePending')}</span>
                <Switch.Control>
                  <Switch.Thumb>
                    <Switch.Icon>{includePending ? <HiCheck /> : <HiXMark />}</Switch.Icon>
                  </Switch.Thumb>
                </Switch.Control>
              </Switch.Content>
            </Switch>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        <div className="mb-2 flex flex-col gap-1">
          <span className="text-muted text-xs">Total:</span>
          <Money amount={total} currency={currency} locale={locale} className="text-md font-semibold" />
        </div>
        <div className={`transition-opacity ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
          <BalanceAreaChart chartData={chartData} currency={currency} locale={locale} renderTooltip={renderTooltip} />
        </div>
      </Card.Content>
      <Card.Footer>
        <div className="text-muted flex w-full items-center justify-end gap-4 pr-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
            <span>{t('Generics.income.plural')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
            <span>{t('Generics.expense.plural')}</span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
}
