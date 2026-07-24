import { Card, Separator } from '@heroui/react';
import type { useTranslations } from 'next-intl';
import { HiArrowTrendingDown, HiArrowTrendingUp, HiEquals } from 'react-icons/hi2';
import { Money } from '@/components/Money';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

const TrendIcon = ({ amount }: { amount: number }) => {
  if (amount < 0) {
    return <HiArrowTrendingDown className="text-xl font-bold text-red-600" />;
  }
  if (amount > 0) {
    return <HiArrowTrendingUp className="text-xl font-bold text-emerald-600 dark:text-emerald-500" />;
  }
  return <HiEquals className="text-xl font-bold text-amber-600 dark:text-amber-300" />;
};

export const CurrencySummaryCardView = ({ currencySummary, locale, t }: Props) => {
  return (
    <Card className="md:min-w-75">
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
  );
};
