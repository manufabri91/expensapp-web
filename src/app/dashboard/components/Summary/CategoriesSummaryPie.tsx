'use client';

import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { CategoryPieChart, CategorySlice, Money, PRESET_COLORS } from '@/components';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { CategorySummaryResponse } from '@/types/dto';

interface Props {
  categorySummaries: CategorySummaryResponse[];
  currency: string;
  locale: string;
}

export default function CategoriesSummaryPie({ categorySummaries, currency, locale }: Props) {
  const t = useTranslations();
  const translateSystemName = useTrySystemTranslations();

  const data: CategorySlice[] = useMemo(() => {
    return categorySummaries
      .filter((category) => category.totals[currency] !== undefined && category.totals[currency] !== 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        value: Math.abs(category.totals[currency]),
        rawAmount: category.totals[currency],
        color: category.color ?? PRESET_COLORS[category.id % PRESET_COLORS.length],
        subCategories: category.subTotalsPerSubCategory
          .filter(
            (subCategory) => subCategory.subtotals[currency] !== undefined && subCategory.subtotals[currency] !== 0
          )
          .map((subCategory) => ({
            id: subCategory.id,
            name: translateSystemName(subCategory.name),
            amount: subCategory.subtotals[currency],
          })),
      }))
      .sort((a, b) => b.value - a.value);
  }, [categorySummaries, currency, translateSystemName]);

  if (data.length === 0) {
    return null;
  }

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="w-full max-w-sm">
      <Card.Content>
        <div className="mb-2 w-full text-left">
          <h3 className="text-medium font-semibold tracking-tight">{t('Dashboard.summary.totalsPerCategory.title')}</h3>
        </div>

        <CategoryPieChart
          data={data}
          renderTooltip={(slice) => (
            <div className="bg-background border-divider rounded-medium shadow-medium text-tiny min-w-45 border px-3 py-2">
              <div className="border-divider mb-1 flex items-center justify-between gap-4 border-b pb-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span className="text-foreground font-semibold">{slice.name}</span>
                </div>
                <Money
                  amount={slice.rawAmount}
                  currency={currency}
                  locale={locale}
                  className="text-tiny font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                {slice.subCategories.map((subCategory) => (
                  <div key={subCategory.id} className="flex justify-between gap-4">
                    <span className="text-default-600">{subCategory.name}</span>
                    <Money amount={subCategory.amount} currency={currency} locale={locale} className="text-tiny" />
                  </div>
                ))}
              </div>
            </div>
          )}
        />

        <div className="border-divider mt-4 grid w-full gap-x-4 gap-y-2 border-t pt-4">
          {data.map((entry) => (
            <div key={entry.id} className="text-small flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-default-600 truncate">{entry.name}</span>
              <span className="text-tiny text-default-400 ml-auto flex items-center gap-1">
                <Money
                  amount={entry.rawAmount}
                  currency={currency}
                  locale={locale}
                  hideNegativeSign
                  className="font-semibold"
                />
                <span className="text-[0.85em]">({Math.round((entry.value / totalValue) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
