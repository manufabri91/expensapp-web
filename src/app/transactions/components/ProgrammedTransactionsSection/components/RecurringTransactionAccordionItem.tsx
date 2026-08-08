'use client';

import { Accordion, Chip } from '@heroui/react';
import { isToday, parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { Icon, Money, TypeBadge } from '@/components';
import { RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';
import { CancelRecurringTransactionButton } from './CancelRecurringTransactionButton';
import { DeleteRecurringTransactionButton } from './DeleteRecurringTransactionButton';
import { EditRecurringTransactionButton } from './EditRecurringTransactionButton';
import { PauseResumeRecurringTransactionButton } from './PauseResumeRecurringTransactionButton';

const DATE_FORMAT_OPTIONS = { year: '2-digit', month: '2-digit', day: '2-digit' } as const;

const statusChipColor = (status: RecurrenceStatus): 'success' | 'warning' | 'default' => {
  if (status === RecurrenceStatus.ACTIVE) return 'success';
  if (status === RecurrenceStatus.PAUSED) return 'warning';
  return 'default';
};

interface RecurringTransactionAccordionItemProps {
  recurrence: RecurringTransactionResponse;
  currency?: string;
  onChanged: () => void;
}

export const RecurringTransactionAccordionItem = ({
  recurrence,
  currency,
  onChanged,
}: RecurringTransactionAccordionItemProps) => {
  const t = useTranslations('RecurringTransactions');
  const format = useFormatter();
  const locale = useLocale();
  // Null once a recurrence's endDate has already passed and it has no more future occurrences
  // left to generate - it still shows up here (only CANCELLED/deleted recurrences are hidden),
  // so this can't assume a value is always present.
  const dueDate = recurrence.nextDueDate ? parseISO(recurrence.nextDueDate) : null;
  const signedAmount = recurrence.type === TransactionType.INCOME ? recurrence.amount : -recurrence.amount;

  return (
    <Accordion.Item id={`RECURRING-${recurrence.id}`}>
      <Accordion.Heading>
        <Accordion.Trigger aria-label={recurrence.description}>
          <div className="flex w-full items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2">
              <Icon
                iconName={recurrence.category.iconName}
                color={recurrence.category.color ?? undefined}
                className="size-6"
              />
              <div className="flex flex-col">
                <span className="font-medium">{recurrence.description}</span>
                <span className="text-muted text-xs">{formatScheduleDescription(recurrence, t, locale)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex flex-row justify-end gap-2">
                <TypeBadge size="sm" type={recurrence.type} />
                <Chip size="sm" color={statusChipColor(recurrence.status)}>
                  <Chip.Label>{t(`status.${recurrence.status}`)}</Chip.Label>
                </Chip>
              </div>
              <Money amount={signedAmount} currency={currency} locale={locale} className="text-md font-bold" />
              <span className="text-muted text-xs">
                {dueDate === null
                  ? t('ended')
                  : isToday(dueDate)
                    ? t('dueToday')
                    : t('dueOn', { date: format.dateTime(dueDate, { month: 'short', day: 'numeric' }) })}
              </span>
              <span className="text-muted text-xs">
                {recurrence.endDate
                  ? t('endsOn', { date: format.dateTime(parseISO(recurrence.endDate), DATE_FORMAT_OPTIONS) })
                  : t('noEndDate')}
              </span>
            </div>
          </div>
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body>
          <div className="flex flex-wrap items-center gap-2">
            <EditRecurringTransactionButton recurrence={recurrence} />
            {recurrence.status !== RecurrenceStatus.CANCELLED && (
              <>
                <PauseResumeRecurringTransactionButton recurrence={recurrence} onChanged={onChanged} />
                <CancelRecurringTransactionButton recurrence={recurrence} onChanged={onChanged} />
              </>
            )}
            <DeleteRecurringTransactionButton recurrence={recurrence} onChanged={onChanged} />
          </div>
        </Accordion.Body>
      </Accordion.Panel>
    </Accordion.Item>
  );
};
