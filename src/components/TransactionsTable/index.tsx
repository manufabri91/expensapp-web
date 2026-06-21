'use client';

import { Pagination, Spinner, Table, toast, Tooltip } from '@heroui/react';
import { parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import useSWR from 'swr';
import { Button } from '@/components/Button';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { Money } from '@/components/Money';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { deleteTransactionById, getTransactions } from '@/lib/actions/transactions';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { TransactionResponse } from '@/types/dto';
import { ActionResult } from '@/types/viewModel/actionResult';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

const useTransactions = (filters: TransactionFilters) => {
  const queryParams = transactionFiltersToQueryParams(filters);

  return useSWR(`/api/transaction${queryParams}`, getTransactions);
};

interface Props {
  showPagination?: boolean;
  pageData?: { size: number; currentPage: number; totalPages: number };
  noTransactionsMessage?: string;
}

export const TransactionsTable = ({ showPagination = false, noTransactionsMessage }: Props) => {
  const { filters, patchFilters } = useTransactionsFilters();
  const { data, isLoading, mutate } = useTransactions(filters);
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();
  const { showTransactionForm, overlayState } = useTransactionForm();
  const openedTransactionForm = overlayState.isOpen;
  const [changedTransaction, setChangedTransaction] = useState<ActionResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      patchFilters({
        currentPage: data.pageable.pageNumber + 1,
        size: data.pageable.size,
        totalPages: data.totalPages,
      });
    }
  }, [data]);

  useEffect(() => {
    if (changedTransaction && !changedTransaction.success) {
      toast.danger(t('TransactionForm.unexpectedError'));
    }
  }, [changedTransaction, t]);

  useEffect(() => {
    if (!openedTransactionForm) {
      setIsEditing(null);
    }
  }, [openedTransactionForm]);

  const deleteHandler = async (tx: TransactionResponse) => {
    setIsDeleting(tx.id);
    try {
      const result = await deleteTransactionById(tx.id);
      setChangedTransaction(result);
      toast.success(t('TransactionForm.deletedSuccess', { id: tx.id }));
      mutate();
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('TransactionForm.unexpectedError'));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const editHandler = async (tx: TransactionResponse) => {
    setIsEditing(tx.id);
    showTransactionForm({ ...tx });
  };

  const pages = useMemo(() => Array.from({ length: filters.totalPages }, (_, i) => i + 1), [filters.totalPages]);

  return (
    <div className="mt-4">
      <Button
        size="sm"
        variant="primary"
        className="w-min"
        onPress={() => {
          showTransactionForm();
        }}
      >
        <HiPlus className="mr-1 size-5" />
        <div className="hidden md:block">{t('Generics.new.female')}</div>
      </Button>

      <Table variant="primary">
        <Table.ScrollContainer>
          <Table.Content aria-label={t('Generics.transaction.plural')}>
            <Table.Header>
              <Table.Column id="description" isRowHeader>
                {t('Generics.description')}
              </Table.Column>
              <Table.Column id="account">{t('Generics.account')}</Table.Column>
              <Table.Column id="category">{t('Generics.category')}</Table.Column>
              <Table.Column id="subcategory">{t('Generics.subcategory')}</Table.Column>
              <Table.Column id="date">{t('Generics.date')}</Table.Column>
              <Table.Column id="amount" className="text-end">
                {t('Generics.amount')}
              </Table.Column>
              <Table.Column id="actions" className="pr-7 text-end">
                {t('Generics.actions')}
              </Table.Column>
            </Table.Header>
            <Table.Body
              items={data?.content ?? []}
              renderEmptyState={() =>
                isLoading ? <Spinner /> : (noTransactionsMessage ?? t('TransactionsTable.noTransactions'))
              }
            >
              {(transaction) => (
                <Table.Row id={transaction.id}>
                  <Table.Cell>
                    <span className="flex items-center gap-2">
                      {AVAILABLE_ICONS.has(transaction.category.iconName) &&
                        React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!, {
                          color: transaction.category.color ?? undefined,
                          className: 'size-6 mr-1',
                        })}
                      {trySystemTranslations(transaction.description)}
                    </span>
                  </Table.Cell>

                  <Table.Cell>{transaction.accountName}</Table.Cell>

                  <Table.Cell>{trySystemTranslations(transaction.category.name)}</Table.Cell>

                  <Table.Cell>{trySystemTranslations(transaction.subcategory.name)}</Table.Cell>

                  <Table.Cell>
                    {format.dateTime(parseISO(transaction.eventDate), {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </Table.Cell>

                  <Table.Cell className="text-right font-semibold">
                    <Money amount={transaction.amount} currency={transaction.currencyCode} locale={locale} />
                  </Table.Cell>

                  <Table.Cell className="flex justify-end gap-1 md:gap-2">
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={isEditing === transaction.id}
                          isIconOnly
                          aria-label={isEditing === transaction.id ? t('Generics.editing') : t('Generics.edit')}
                          onPress={() => editHandler(transaction)}
                          variant="ghost"
                        >
                          <HiPencil />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {isEditing === transaction.id ? t('Generics.editing') : t('Generics.edit')}
                      </Tooltip.Content>
                    </Tooltip>
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          isDisabled={isDeleting === transaction.id}
                          aria-label={isDeleting === transaction.id ? t('Generics.deleting') : t('Generics.delete')}
                          onPress={() => deleteHandler(transaction)}
                          variant="danger"
                        >
                          <HiTrash />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        {isDeleting === transaction.id ? t('Generics.deleting') : t('Generics.delete')}
                      </Tooltip.Content>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        {showPagination && filters && filters.totalPages > 1 && (
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
                    <Pagination.Link
                      isActive={p === filters.currentPage}
                      onPress={() => patchFilters({ currentPage: p })}
                    >
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
        )}
      </Table>
    </div>
  );
};
