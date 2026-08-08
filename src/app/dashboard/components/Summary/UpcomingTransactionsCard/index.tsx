'use client';

import { Card } from '@heroui/react';
import { isToday, parseISO } from 'date-fns';
import NextLink from 'next/link';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { HiChevronRight } from 'react-icons/hi2';
import { Icon } from '@/components/Icon';
import { Money } from '@/components/Money';
import { UpcomingTransactionItem } from '@/types/dto';
import { Icon as IconName } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';

interface Props {
  title: string;
  currency: string;
  total: number;
  items: UpcomingTransactionItem[];
  footerHref: string;
}

export const UpcomingTransactionsCard = ({ title, currency, total, items, footerHref }: Props) => {
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
          {items.map((item) => {
            const dueDate = parseISO(item.date);
            // A RECURRING item's frequency/daysOfMonth are only nullable at the type level to
            // accommodate ONE_TIME items sharing this DTO - for RECURRING items the backend always
            // populates them, so it's safe to narrow them here once sourceType has been checked.
            const scheduleText =
              item.sourceType === 'RECURRING'
                ? formatScheduleDescription(
                    {
                      frequency: item.frequency as RecurrenceFrequency,
                      intervalDays: item.intervalDays,
                      daysOfMonth: item.daysOfMonth as number[],
                    },
                    tSchedule,
                    locale
                  )
                : null;

            return (
              <div
                key={`${item.sourceType}-${item.sourceId}`}
                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <Icon iconName={item.categoryIconName as IconName} color={item.categoryColor} className="size-6" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.description}</span>
                    {scheduleText && <span className="text-muted text-xs">{scheduleText}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted text-xs">
                    {isToday(dueDate)
                      ? t('dueToday')
                      : t('dueOn', { date: format.dateTime(dueDate, { month: 'short', day: 'numeric' }) })}
                  </span>
                  <Money amount={item.signedAmount} currency={currency} locale={locale} />
                </div>
              </div>
            );
          })}
        </div>
      </Card.Content>
      <Card.Footer>
        <NextLink
          href={footerHref}
          className="text-accent flex w-full items-center justify-between gap-1 text-sm font-medium hover:underline"
        >
          {t('goToScheduledPayments')}
          <HiChevronRight className="size-4" />
        </NextLink>
      </Card.Footer>
    </Card>
  );
};
