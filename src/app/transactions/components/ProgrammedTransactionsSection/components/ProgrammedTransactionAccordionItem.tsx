'use client';

import { Accordion } from '@heroui/react';
import { isToday, parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { Icon, Money } from '@/components';
import { UpcomingTransactionItem } from '@/types/dto';
import { Icon as IconName } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';

interface ProgrammedTransactionAccordionItemProps {
  item: UpcomingTransactionItem;
  currency?: string;
  /**
   * Row actions rendered inside the expandable panel. Left out for a RECURRING item whose full
   * recurrence hasn't arrived yet (the two lists are fetched independently), so the row still
   * renders but offers no action that would target a recurrence we can't see.
   */
  actions?: ReactNode;
}

export const ProgrammedTransactionAccordionItem = ({
  item,
  currency,
  actions,
}: ProgrammedTransactionAccordionItemProps) => {
  const t = useTranslations('RecurringTransactions');
  const format = useFormatter();
  const locale = useLocale();
  // Null for an ended recurrence (endDate already passed, no occurrences left) - the same case
  // RecurringTransactionAccordionItem handles via its own nullable `nextDueDate`.
  const dueDate = item.date ? parseISO(item.date) : null;
  // A RECURRING item's frequency/daysOfMonth are only nullable at the type level to accommodate
  // ONE_TIME items sharing this DTO - for RECURRING items the backend always populates them, so
  // it's safe to narrow them here once sourceType has been checked.
  const scheduleText =
    item.sourceType === 'RECURRING'
      ? formatScheduleDescription(
          {
            frequency: item.frequency as RecurrenceFrequency,
            intervalDays: item.intervalDays,
            daysOfMonth: item.daysOfMonth ?? [],
          },
          t,
          locale
        )
      : null;

  return (
    <Accordion.Item id={`${item.sourceType}-${item.sourceId}`}>
      <Accordion.Heading>
        <Accordion.Trigger aria-label={item.description}>
          <div className="flex w-full items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <Icon iconName={item.categoryIconName as IconName} color={item.categoryColor} className="size-6" />
              <div className="flex flex-col">
                <span className="font-medium">{item.description}</span>
                {scheduleText && <span className="text-muted text-xs">{scheduleText}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Money amount={item.signedAmount} currency={currency} locale={locale} className="text-md font-bold" />
              <span className="text-muted text-xs">
                {dueDate === null
                  ? t('ended')
                  : isToday(dueDate)
                    ? t('dueToday')
                    : t('dueOn', { date: format.dateTime(dueDate, { month: 'short', day: 'numeric' }) })}
              </span>
            </div>
          </div>
        </Accordion.Trigger>
      </Accordion.Heading>
      {actions && (
        <Accordion.Panel>
          <Accordion.Body>
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </Accordion.Body>
        </Accordion.Panel>
      )}
    </Accordion.Item>
  );
};
