'use client';

import { Card } from '@heroui/react';
import { isToday, parseISO } from 'date-fns';
import NextLink from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { HiChevronRight } from 'react-icons/hi2';
import { Icon } from '@/components/Icon';
import { Money } from '@/components/Money';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';
import { UpcomingRecurringItem } from '@/utils/upcomingRecurringTransactions';

interface Props {
  title: string;
  currency: string;
  total: number;
  items: UpcomingRecurringItem[];
}

export const UpcomingRecurringCard = ({ title, currency, total, items }: Props) => {
  const t = useTranslations('Dashboard.summary.upcoming');
  const tSchedule = useTranslations('RecurringTransactions');
  const format = useFormatter();
  const locale = useLocale();

  return (
    <Card className="h-min w-full min-w-100 md:max-w-md">
      <Card.Header>
        <div className="flex w-full items-center justify-between gap-4">
          <Card.Title>{title}</Card.Title>
          <Money amount={total} currency={currency} locale={locale} className="text-lg font-semibold" />
        </div>
      </Card.Header>
      <Card.Content>
        <div className="divide-y">
          {items.map(({ recurrence, signedAmount }) => {
            const dueDate = parseISO(recurrence.nextDueDate!);
            return (
              <div key={recurrence.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Icon
                    iconName={recurrence.category.iconName}
                    color={recurrence.category.color ?? undefined}
                    className="size-6"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{recurrence.description}</span>
                    <span className="text-muted text-xs">
                      {formatScheduleDescription(recurrence, tSchedule, locale)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted text-xs">
                    {isToday(dueDate)
                      ? t('dueToday')
                      : t('dueOn', { date: format.dateTime(dueDate, { month: 'short', day: 'numeric' }) })}
                  </span>
                  <Money amount={signedAmount} currency={currency} locale={locale} />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
      <Card.Footer>
        <NextLink
          href="/transactions#recurring-transactions"
          className="text-accent flex w-full items-center justify-between gap-1 text-sm font-medium hover:underline"
        >
          {t('goToScheduledPayments')}
          <HiChevronRight className="size-4" />
        </NextLink>
      </Card.Footer>
    </Card>
  );
};
