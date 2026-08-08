'use client';

import { Accordion, Card, EmptyState, Spinner } from '@heroui/react';
import { compareAsc, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import { ReactNode, useMemo } from 'react';
import { AccountResponse, RecurringTransactionResponse, UpcomingTransactionItem } from '@/types/dto';
import { ConfirmPendingTransactionButton } from './ConfirmPendingTransactionButton';
import { EditPendingTransactionButton } from './EditPendingTransactionButton';
import { ProgrammedTransactionAccordionItem } from './ProgrammedTransactionAccordionItem';
import { RecurringTransactionAccordionItem } from './RecurringTransactionAccordionItem';
import { RemovePendingTransactionButton } from './RemovePendingTransactionButton';

/**
 * Mirrors the backend's `nullsLast` ordering: an ended recurrence has no next occurrence, so it
 * sorts after everything that is still scheduled instead of jumping to the top of the list.
 */
const compareByDateNullsLast = (first: UpcomingTransactionItem, second: UpcomingTransactionItem): number => {
  if (first.date === null) return second.date === null ? 0 : 1;
  if (second.date === null) return -1;
  return compareAsc(parseISO(first.date), parseISO(second.date));
};

/**
 * The two id→entity maps every row needs to resolve itself: recurring rows carry only a
 * `sourceId` (their full recurrence lives in a separately fetched list) and every row carries
 * only an `accountId` (its currency lives in the accounts provider).
 */
export interface ProgrammedTransactionLookups {
  recurrencesById: Map<number, RecurringTransactionResponse>;
  accountsById: Map<number, AccountResponse>;
}

interface ProgrammedTransactionsCardProps {
  title: string;
  anchorId: string;
  items: UpcomingTransactionItem[];
  isLoading: boolean;
  lookups: ProgrammedTransactionLookups;
  onChanged: () => void;
}

export const ProgrammedTransactionsCard = ({
  title,
  anchorId,
  items,
  isLoading,
  lookups,
  onChanged,
}: ProgrammedTransactionsCardProps) => {
  const t = useTranslations('ProgrammedTransactions');
  const sortedItems = useMemo(() => [...items].sort(compareByDateNullsLast), [items]);

  const renderItem = (item: UpcomingTransactionItem): ReactNode => {
    const currency = lookups.accountsById.get(item.accountId)?.currency;
    const key = `${item.sourceType}-${item.sourceId}`;

    if (item.sourceType === 'RECURRING') {
      const recurrence = lookups.recurrencesById.get(item.sourceId);
      // A recurrence can be missing while the two independently fetched lists are out of sync
      // (e.g. it was just deleted). Render the row from the item's own fields, without actions.
      return recurrence ? (
        <RecurringTransactionAccordionItem
          key={key}
          recurrence={recurrence}
          currency={currency}
          onChanged={onChanged}
        />
      ) : (
        <ProgrammedTransactionAccordionItem key={key} item={item} currency={currency} />
      );
    }

    return (
      <ProgrammedTransactionAccordionItem
        key={key}
        item={item}
        currency={currency}
        actions={
          <>
            <EditPendingTransactionButton transactionId={item.sourceId} />
            <ConfirmPendingTransactionButton transactionId={item.sourceId} onChanged={onChanged} />
            <RemovePendingTransactionButton transactionId={item.sourceId} onChanged={onChanged} />
          </>
        }
      />
    );
  };

  return (
    <Card className="w-full" id={anchorId}>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : sortedItems.length === 0 ? (
          <EmptyState className="flex w-full flex-col items-center justify-center gap-2 py-8 text-center">
            <span className="text-muted text-sm">{t('noProgrammed')}</span>
          </EmptyState>
        ) : (
          <Accordion variant="surface">{sortedItems.map(renderItem)}</Accordion>
        )}
      </Card.Content>
    </Card>
  );
};
