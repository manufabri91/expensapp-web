'use client';

import { EmptyState, Pagination, Spinner, Table } from '@heroui/react';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { HiOutlineInbox, HiPlus } from 'react-icons/hi2';
import { TransactionFiltersBar } from '@/app/transactions/components/TransactionFiltersBar';
import { Button } from '@/components/Button';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionTableColumns } from '@/components/TransactionsTable/TransactionTableColumns';
import { TransactionTableColumnsMobile } from '@/components/TransactionsTable/TransactionTableColumnsMobile';
import { TransactionTableRow } from '@/components/TransactionsTable/TransactionTableRow';
import { TransactionTableRowMobile } from '@/components/TransactionsTable/TransactionTableRowMobile';
import { usePaginationSync } from '@/components/TransactionsTable/usePaginationSync';
import { useTransactionRowActions } from '@/components/TransactionsTable/useTransactionRowActions';
import { useTransactions } from '@/components/TransactionsTable/useTransactions';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';

interface Props {
  showPagination?: boolean;
  noTransactionsMessage?: string;
  initialData?: PagedResponse<TransactionResponse>;
}

export const TransactionsTable = ({ showPagination = false, noTransactionsMessage, initialData }: Props) => {
  const { filters, patchFilters } = useTransactionsFilters();
  const { data, isLoading, mutate } = useTransactions(filters, initialData);
  const t = useTranslations();
  const { showTransactionForm } = useTransactionForm();
  const { deleteHandler, editHandler, isDeleting, isEditing } = useTransactionRowActions(() => mutate());

  usePaginationSync(data, patchFilters);

  const pages = useMemo(() => Array.from({ length: filters.totalPages }, (_, i) => i + 1), [filters.totalPages]);

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

  const paginationFooter = showPagination && filters && filters.totalPages > 1 && (
    <Table.Footer>
      <Pagination size="sm">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={filters.currentPage === 1}
              onPress={() => patchFilters({ currentPage: Math.max(1, filters.currentPage - 1) })}
            >
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>
          {pages.map((p) => (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === filters.currentPage} onPress={() => patchFilters({ currentPage: p })}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={filters.currentPage === filters.totalPages}
              onPress={() => patchFilters({ currentPage: Math.min(filters.totalPages, filters.currentPage + 1) })}
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </Table.Footer>
  );

  return (
    <div className="mt-4">
      <div className="mb-4 flex items-end gap-4">
        <Button
          size="md"
          variant="primary"
          onPress={() => {
            showTransactionForm();
          }}
        >
          <HiPlus className="size-5 md:mr-1" />
          <div className="hidden md:block">{t('Generics.new.female')}</div>
        </Button>
        <TransactionFiltersBar />
      </div>

      <Table className="hidden md:block">
        <Table.ScrollContainer>
          <Table.Content aria-label={t('Generics.transaction.plural')}>
            <TransactionTableColumns />
            <Table.Body items={data?.content ?? []} renderEmptyState={renderEmptyState}>
              {(transaction) => (
                <TransactionTableRow
                  transaction={transaction}
                  isEditing={isEditing === transaction.id}
                  isDeleting={isDeleting === transaction.id}
                  onEdit={editHandler}
                  onDelete={deleteHandler}
                />
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        {paginationFooter}
      </Table>

      <Table className="md:hidden">
        <Table.ScrollContainer>
          <Table.Content aria-label={t('Generics.transaction.plural')}>
            <TransactionTableColumnsMobile />
            <Table.Body items={data?.content ?? []} renderEmptyState={renderEmptyState}>
              {(transaction) => (
                <TransactionTableRowMobile
                  transaction={transaction}
                  isEditing={isEditing === transaction.id}
                  isDeleting={isDeleting === transaction.id}
                  onEdit={editHandler}
                  onDelete={deleteHandler}
                />
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        {paginationFooter}
      </Table>
    </div>
  );
};
