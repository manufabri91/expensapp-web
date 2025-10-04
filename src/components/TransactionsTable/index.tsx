'use client';

import { Pagination } from '@heroui/pagination';
import { Spinner } from '@heroui/spinner';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/table';
import { addToast } from '@heroui/toast';
import { Tooltip } from '@heroui/tooltip';
import { parseISO } from 'date-fns';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
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
  const { showTransactionForm, isOpen: openedTransactionForm } = useTransactionForm();
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
      addToast({ title: t('TransactionForm.unexpectedError'), color: 'danger' });
    }
  }, [changedTransaction, addToast, t]);

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
      addToast({ title: t('TransactionForm.deletedSuccess', { id: tx.id }), color: 'success' });
      mutate();
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('TransactionForm.unexpectedError'), color: 'danger' });
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const editHandler = async (tx: TransactionResponse) => {
    setIsEditing(tx.id);
    showTransactionForm({ ...tx });
  };

  const loadingState = isLoading ? 'loading' : 'idle';

  // data?.content.length === 0

  return (
    <Table
      className="mt-4"
      aria-label={t('Generics.transaction.plural')}
      topContent={
        <Button
          size="sm"
          color="primary"
          className="w-min"
          onPress={() => {
            showTransactionForm();
          }}
        >
          <HiPlus className="mr-1 size-5" />
          <div className="hidden md:block">{t('Generics.new.female')}</div>
        </Button>
      }
      bottomContent={
        showPagination && filters && filters.totalPages > 0 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={filters.currentPage}
              total={filters.totalPages}
              onChange={(page) => patchFilters({ currentPage: page })}
            />
          </div>
        ) : null
      }
    >
      <TableHeader>
        <TableColumn>{t('Generics.description')}</TableColumn>
        <TableColumn>{t('Generics.account')}</TableColumn>
        <TableColumn>{t('Generics.category')}</TableColumn>
        <TableColumn>{t('Generics.subcategory')}</TableColumn>
        <TableColumn>{t('Generics.date')}</TableColumn>
        <TableColumn className="text-end">{t('Generics.amount')}</TableColumn>
        <TableColumn className="pr-7 text-end">{t('Generics.actions')}</TableColumn>
      </TableHeader>
      <TableBody
        className="divide-y text-base"
        items={data?.content ?? []}
        loadingContent={<Spinner />}
        loadingState={loadingState}
        emptyContent={noTransactionsMessage ?? t('TransactionsTable.noTransactions')}
      >
        {(transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              <span className="flex items-center gap-2">
                {AVAILABLE_ICONS.has(transaction.category.iconName) &&
                  React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!, {
                    color: transaction.category.color ?? undefined,
                    className: 'size-6 mr-1',
                  })}
                {trySystemTranslations(transaction.description)}
              </span>
            </TableCell>

            <TableCell>{transaction.accountName}</TableCell>

            <TableCell>{trySystemTranslations(transaction.category.name)}</TableCell>

            <TableCell>{trySystemTranslations(transaction.subcategory.name)}</TableCell>

            <TableCell>
              {format.dateTime(parseISO(transaction.eventDate), {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })}
            </TableCell>

            <TableCell className="text-right font-semibold">
              <Money amount={transaction.amount} currency={transaction.currencyCode} locale={locale} />
            </TableCell>

            <TableCell className="flex justify-end gap-1 md:gap-2">
              <Tooltip
                content={isEditing === transaction.id ? t('Generics.editing') : t('Generics.edit')}
                color="secondary"
              >
                <Button
                  isDisabled={isEditing === transaction.id}
                  isLoading={isEditing === transaction.id}
                  isIconOnly
                  aria-label={isEditing === transaction.id ? t('Generics.editing') : t('Generics.edit')}
                  onPress={() => editHandler(transaction)}
                  color="secondary"
                  variant="light"
                >
                  <HiPencil />
                </Button>
              </Tooltip>
              <Tooltip
                color="danger"
                content={isDeleting === transaction.id ? t('Generics.deleting') : t('Generics.delete')}
              >
                <Button
                  isIconOnly
                  isDisabled={isDeleting === transaction.id}
                  isLoading={isDeleting === transaction.id}
                  aria-label={isDeleting === transaction.id ? t('Generics.deleting') : t('Generics.delete')}
                  onPress={() => deleteHandler(transaction)}
                  color="danger"
                  variant="light"
                >
                  <HiTrash />
                </Button>
              </Tooltip>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
