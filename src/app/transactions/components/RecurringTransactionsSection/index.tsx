'use client';

import { Accordion, Chip, EmptyState, Spinner } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Money, TypeBadge } from '@/components';
import { getRecurringTransactions } from '@/lib/actions/recurringTransactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';
import {
  CancelRecurringTransactionButton,
  DeleteRecurringTransactionButton,
  EditRecurringTransactionButton,
  PauseResumeRecurringTransactionButton,
} from './RecurringTransactionActions';

const statusChipColor = (status: RecurrenceStatus): 'success' | 'warning' | 'default' => {
  if (status === RecurrenceStatus.ACTIVE) return 'success';
  if (status === RecurrenceStatus.PAUSED) return 'warning';
  return 'default';
};

const useRecurringTransactions = () => useSWR('/api/recurring-transaction', getRecurringTransactions);

export const RecurringTransactionsSection = () => {
  const t = useTranslations('RecurringTransactions');
  const { accounts } = useAccounts();
  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const { data: recurrences, isLoading, mutate } = useRecurringTransactions();

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h3>
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
            return (
              <Accordion.Item id={recurrence.id} key={recurrence.id}>
                <Accordion.Heading>
                  <Accordion.Trigger aria-label={recurrence.description}>
                    <div className="flex w-full flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <TypeBadge size="sm" type={recurrence.type} />
                        <h4 className="font-medium">{recurrence.description}</h4>
                        <Money amount={recurrence.amount} currency={account?.currency} hideNegativeSign />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted text-sm">{formatScheduleDescription(recurrence, t)}</span>
                        <Chip size="sm" color={statusChipColor(recurrence.status)}>
                          <Chip.Label>{t(`status.${recurrence.status}`)}</Chip.Label>
                        </Chip>
                      </div>
                    </div>
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    <div className="text-muted mb-4 flex flex-wrap gap-4 text-sm">
                      {recurrence.nextDueDate && (
                        <span>{t('nextOccurrence', { date: recurrence.nextDueDate.slice(0, 10) })}</span>
                      )}
                      <span>{recurrence.endDate ? t('endsOn', { date: recurrence.endDate.slice(0, 10) }) : t('noEndDate')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <EditRecurringTransactionButton recurrence={recurrence} />
                      {recurrence.status !== RecurrenceStatus.CANCELLED && (
                        <PauseResumeRecurringTransactionButton recurrence={recurrence} onChanged={() => mutate()} />
                      )}
                      {recurrence.status !== RecurrenceStatus.CANCELLED && (
                        <CancelRecurringTransactionButton recurrence={recurrence} onChanged={() => mutate()} />
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
    </div>
  );
};
