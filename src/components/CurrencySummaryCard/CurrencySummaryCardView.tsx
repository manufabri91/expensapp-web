import { Card, Chip, Separator } from '@heroui/react';
import clsx from 'clsx';
import type { useTranslations } from 'next-intl';
import { HiArrowDown, HiArrowRight, HiArrowUp } from 'react-icons/hi2';
import { Money } from '@/components/Money';
import { CurrencySummaryResponse } from '@/types/dto';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

const TrendIcon = ({ amount, className }: { amount: number; className?: string }) => {
  const classes = clsx('text-xl font-bold', className);
  if (amount < 0) {
    return <HiArrowDown className={classes + ' text-red-600'} />;
  }
  if (amount > 0) {
    return <HiArrowUp className={classes + ' text-emerald-600 dark:text-emerald-500'} />;
  }
  return <HiArrowRight className={classes + ' text-amber-600 dark:text-amber-300'} />;
};

export const CurrencySummaryCardView = ({ currencySummary, locale, t }: Props) => {
  return (
    <Card className="md:min-w-75">
      <Card.Header>
        <Card.Title>
          {t('Dashboard.summary.balance.current.title', {
            currencyCode: currencySummary.currency,
          })}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex h-fit w-fit flex-col items-center justify-between self-center">
          <Chip variant="secondary">
            <Chip.Label>
              <Money locale={locale} amount={currencySummary.incomes + currencySummary.expenses} warnIfZero />
            </Chip.Label>
            <TrendIcon amount={currencySummary.incomes + currencySummary.expenses} className="size-4" />
          </Chip>
          <Money
            locale={locale}
            amount={currencySummary.totalBalance}
            currency={currencySummary.currency}
            className="h-min overflow-hidden text-2xl font-bold"
            warnIfZero
          />
        </div>

        <div className="relative">
          <Separator />
        </div>
        <div className="mt-2 flex flex-col text-sm">
          <div className="flex justify-center gap-4">
            <span className="mr-1">{t('Generics.income.plural')}:</span>
            <Money
              amount={currencySummary.incomes}
              currency={currencySummary.currency}
              locale={locale}
              className="overflow-hidden"
            />
          </div>
          <div className="flex justify-center gap-4">
            <span className="mr-1">{t('Generics.expense.plural')}:</span>
            <Money
              amount={currencySummary.expenses}
              currency={currencySummary.currency}
              locale={locale}
              className="overflow-hidden"
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};
