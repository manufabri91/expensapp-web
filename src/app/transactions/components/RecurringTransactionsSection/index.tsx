'use client';

import { Accordion, Card, Chip, EmptyState, Spinner } from '@heroui/react';
import { isToday, parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Icon, Money, TypeBadge } from '@/components';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';
import { CancelRecurringTransactionButton } from './components/CancelRecurringTransactionButton';
import { DeleteRecurringTransactionButton } from './components/DeleteRecurringTransactionButton';
import { EditRecurringTransactionButton } from './components/EditRecurringTransactionButton';
import { PauseResumeRecurringTransactionButton } from './components/PauseResumeRecurringTransactionButton';

const DATE_FORMAT_OPTIONS = { year: '2-digit', month: '2-digit', day: '2-digit' } as const;

const statusChipColor = (status: RecurrenceStatus): 'success' | 'warning' | 'default' => {
  if (status === RecurrenceStatus.ACTIVE) return 'success';
  if (status === RecurrenceStatus.PAUSED) return 'warning';
  return 'default';
};

const useRecurringTransactions = () => useSWR('/api/recurring-transaction', getRecurringTransactions);

export const RecurringTransactionsSection = () => {
  const t = useTranslations('RecurringTransactions');
  const format = useFormatter();
  const locale = useLocale();
  const { accounts } = useAccounts();
  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const { data: recurrences, isLoading, mutate } = useRecurringTransactions();

  return (
    <Card className="w-full md:max-w-lg" id="recurring-transactions">
      <Card.Header>
        <Card.Title>{t('title')}</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        )}
        {!isLoading && (!recurrences || recurrences.length === 0) && (
          <EmptyState className="flex w-full flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="text-muted text-sm">{t('noRecurring')}</span>
          </EmptyState>
        )}
        {!isLoading && recurrences && recurrences.length > 0 && (
          <Accordion variant="surface">
            {recurrences.map((recurrence) => {
              const account = accountsById.get(recurrence.accountId);
              // Null once a recurrence's endDate has already passed and it has no more future
              // occurrences left to generate - it still shows up here (only CANCELLED/deleted
              // recurrences are hidden), so this can't assume a value is always present.
              const dueDate = recurrence.nextDueDate ? parseISO(recurrence.nextDueDate) : null;
              const signedAmount = recurrence.type === TransactionType.INCOME ? recurrence.amount : -recurrence.amount;
              return (
                <Accordion.Item id={recurrence.id} key={recurrence.id}>
                  <Accordion.Heading>
                    <Accordion.Trigger aria-label={recurrence.description}>
                      <div key={recurrence.id} className="flex w-full items-center justify-between gap-3 px-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            iconName={recurrence.category.iconName}
                            color={recurrence.category.color ?? undefined}
                            className="size-6"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{recurrence.description}</span>
                            <span className="text-muted text-xs">
                              {formatScheduleDescription(recurrence, t, locale)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex flex-row justify-end gap-2">
                            <TypeBadge size="sm" type={recurrence.type} />
                            <Chip size="sm" color={statusChipColor(recurrence.status)}>
                              <Chip.Label>{t(`status.${recurrence.status}`)}</Chip.Label>
                            </Chip>
                          </div>
                          <Money
                            amount={signedAmount}
                            currency={account?.currency}
                            locale={locale}
                            className="text-md font-bold"
                          />
                          <span className="text-muted text-xs">
                            {dueDate === null
                              ? t('ended')
                              : isToday(dueDate)
                                ? t('dueToday')
                                : t('dueOn', { date: format.dateTime(dueDate, { month: 'short', day: 'numeric' }) })}
                          </span>
                          <span className="text-muted text-xs">
                            {recurrence.endDate
                              ? t('endsOn', {
                                  date: format.dateTime(parseISO(recurrence.endDate), DATE_FORMAT_OPTIONS),
                                })
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
                            <PauseResumeRecurringTransactionButton recurrence={recurrence} onChanged={() => mutate()} />
                            <CancelRecurringTransactionButton recurrence={recurrence} onChanged={() => mutate()} />
                          </>
                        )}
                        <DeleteRecurringTransactionButton recurrence={recurrence} onChanged={() => mutate()} />
                      </div>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        )}
      </Card.Content>
    </Card>
  );
};
