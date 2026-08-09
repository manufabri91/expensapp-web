import { Card, Chip, Separator } from '@heroui/react';
import type { useTranslations } from 'next-intl';
import { Money } from '@/components/Money';
import { TrendIcon } from '@/components/TrendIcon';
import { CurrencySummaryResponse } from '@/types/dto';

type Variant = 'accountBalance' | 'periodTotal';

interface Props {
  currencySummary: CurrencySummaryResponse;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  variant?: Variant;
}

const TITLE_KEY: Record<Variant, string> = {
  accountBalance: 'Dashboard.summary.balance.current.title',
  periodTotal: 'Transactions.summary.total.title',
};

export const CurrencySummaryCardView = ({ currencySummary, locale, t, variant = 'accountBalance' }: Props) => {
  return (
    <Card className="h-min w-full md:max-w-md md:min-w-100">
      <Card.Header>
        <Card.Title>
          {t(TITLE_KEY[variant], {
            currencyCode: currencySummary.currency,
          })}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="flex h-fit w-fit flex-col items-center justify-between self-center">
          {variant === 'accountBalance' && (
            <Chip variant="secondary">
              <Chip.Label>
                <Money locale={locale} amount={currencySummary.incomes + currencySummary.expenses} warnIfZero />
              </Chip.Label>
              <TrendIcon amount={currencySummary.incomes + currencySummary.expenses} className="size-4" />
            </Chip>
          )}
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
