'use client';

import { EmptyState, Spinner, Table } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { HiOutlineInbox, HiPlus } from 'react-icons/hi2';
import { Button } from '@/components/Button';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionTableColumns } from '@/components/TransactionsTable/TransactionTableColumns';
import { TransactionTableColumnsMobile } from '@/components/TransactionsTable/TransactionTableColumnsMobile';
import { TransactionTableRow } from '@/components/TransactionsTable/TransactionTableRow';
import { TransactionTableRowMobile } from '@/components/TransactionsTable/TransactionTableRowMobile';
import { useInfiniteTransactions } from '@/components/TransactionsTable/useInfiniteTransactions';
import { useTransactionRowActions } from '@/components/TransactionsTable/useTransactionRowActions';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';

interface Props {
  noTransactionsMessage?: string;
  initialData?: PagedResponse<TransactionResponse>;
}

export const InfiniteTransactionsTable = ({ noTransactionsMessage, initialData }: Props) => {
  const t = useTranslations();
  const { filters } = useTransactionsFilters();
  const { data, isLoading, isValidating, size, setSize, mutate } = useInfiniteTransactions(filters, initialData);
  const { showTransactionForm } = useTransactionForm();
  const { deleteHandler, editHandler, isDeleting, isEditing } = useTransactionRowActions(() => mutate());
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const rows = useMemo(() => {
    const seen = new Set<number>();
    return (data ?? [])
      .flatMap((page) => page.content)
      .filter((tx) => (seen.has(tx.id) ? false : (seen.add(tx.id), true)));
  }, [data]);

  const hasMore = data ? !data[data.length - 1]?.last : false;

  useEffect(() => {
    if (!isValidating) {
      setIsLoadingMore(false);
    }
  }, [isValidating]);

  const loadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setSize(size + 1);
  };

  const renderEmptyState = () => (
    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
      {!isLoading && (
        <>
          <HiOutlineInbox />
          <span className="text-muted text-sm">{noTransactionsMessage ?? t('TransactionsTable.noTransactions')}</span>
        </>
      )}
      {isLoading && <Spinner size="md" />}
    </EmptyState>
  );

  const loadMoreSentinel = hasMore && (
    <Table.LoadMore isLoading={isLoadingMore} onLoadMore={loadMore}>
      <Table.LoadMoreContent>
        <Spinner size="md" />
      </Table.LoadMoreContent>
    </Table.LoadMore>
  );

  return (
    <div className="mt-4">
      <Button
        size="md"
        variant="primary"
        className="mb-4"
        onPress={() => {
          showTransactionForm();
        }}
      >
        <HiPlus className="size-5 md:mr-1" />
        <div className="hidden md:block">{t('Generics.new.female')}</div>
      </Button>

      <Table className="hidden md:block">
        <Table.ScrollContainer className="max-h-120 overflow-y-auto">
          <Table.Content aria-label={t('Generics.transaction.plural')}>
            <TransactionTableColumns />
            <Table.Body renderEmptyState={renderEmptyState}>
              <Table.Collection items={rows}>
                {(transaction) => (
                  <TransactionTableRow
                    transaction={transaction}
                    isEditing={isEditing === transaction.id}
                    isDeleting={isDeleting === transaction.id}
                    onEdit={editHandler}
                    onDelete={deleteHandler}
                  />
                )}
              </Table.Collection>
              {loadMoreSentinel}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Table className="md:hidden">
        <Table.ScrollContainer className="max-h-120 overflow-y-auto">
          <Table.Content aria-label={t('Generics.transaction.plural')}>
            <TransactionTableColumnsMobile />
            <Table.Body renderEmptyState={renderEmptyState}>
              <Table.Collection items={rows}>
                {(transaction) => (
                  <TransactionTableRowMobile
                    transaction={transaction}
                    isEditing={isEditing === transaction.id}
                    isDeleting={isDeleting === transaction.id}
                    onEdit={editHandler}
                    onDelete={deleteHandler}
                  />
                )}
              </Table.Collection>
              {loadMoreSentinel}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
};
