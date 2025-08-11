'use client';

import { HiTrash, HiPencil, HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components/Button';
import { Money } from '@/components/Money';
import { ToastType } from '@/components/Toast';
import { useToaster } from '@/components/Toast/ToastProvider';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { parseISO } from 'date-fns';
import { Dropdown, Pagination, Table } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { ActionResult } from '@/types/viewModel/actionResult';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { useFormatter, useLocale, useTranslations } from 'next-intl';

interface Props {
  transactions: TransactionResponse[];
  showPagination?: boolean;
  noTransactionsMessage?: string;
}

export const TransactionsTable = ({ transactions, showPagination = false, noTransactionsMessage }: Props) => {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();
  const { showToast, clearToast } = useToaster();
  const { showTransactionForm, isOpen: openedTransactionForm } = useTransactionForm();
  const { filters, patchFilters } = useTransactionsFilters();
  const [changedTransaction, setChangedTransaction] = useState<ActionResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    if (changedTransaction && !changedTransaction.success) {
      showToast(t('TransactionForm.unexpectedError'));
    }
  }, [changedTransaction, showToast, clearToast, t]);

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
      showToast(t('TransactionForm.deletedSuccess', { id: tx.id }), ToastType.Success);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, ToastType.Error);
      } else {
        showToast(t('TransactionForm.unexpectedError'), ToastType.Error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const editHandler = async (tx: TransactionResponse) => {
    setIsEditing(tx.id);
    showTransactionForm(tx);
  };

  if (transactions.length === 0) {
    return (
      <div>
        <Button
          size="sm"
          variant={ButtonVariant.Primary}
          className="w-min justify-self-end md:min-w-28"
          title={t('Generics.new.female')}
          onClick={() => {
            showTransactionForm();
          }}
        >
          <HiPlus className="mr-1 size-5" />
          <div className="hidden md:block">{t('Generics.new.female')}</div>
        </Button>
        <p className="text-center text-slate-800 dark:text-white">
          {noTransactionsMessage ?? t('TransactionsTable.noTransactions')}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>{t('Generics.description')}</Table.HeadCell>
          <Table.HeadCell>{t('Generics.account')}</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">{t('Generics.category')}</Table.HeadCell>
          <Table.HeadCell className="hidden lg:table-cell">{t('Generics.subcategory')}</Table.HeadCell>
          <Table.HeadCell>{t('Generics.date')}</Table.HeadCell>
          <Table.HeadCell>{t('Generics.amount')}</Table.HeadCell>
          <Table.HeadCell className="flex justify-end">
            <Button
              size="sm"
              variant={ButtonVariant.Primary}
              className="w-min md:min-w-28"
              title={t('Generics.new.female')}
              onClick={() => {
                showTransactionForm();
              }}
            >
              <HiPlus className="mr-1 size-5" />
              <div className="hidden md:block">{t('Generics.new.female')}</div>
            </Button>
            <span className="sr-only">{t('Generics.actions')}</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-base">
          {transactions.map((transaction) => (
            <Table.Row key={transaction.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <span className="flex items-center gap-2">
                  {AVAILABLE_ICONS.has(transaction.category.iconName) &&
                    React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!, {
                      color: transaction.category.color ?? undefined,
                      className: 'size-6 mr-1',
                    })}
                  {trySystemTranslations(transaction.description)}
                </span>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {transaction.accountName}
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {trySystemTranslations(transaction.category.name)}
              </Table.Cell>
              <Table.Cell className="hidden lg:table-cell">
                {trySystemTranslations(transaction.subcategory.name)}
              </Table.Cell>
              <Table.Cell>
                {format.dateTime(parseISO(transaction.eventDate), {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </Table.Cell>

              <Table.Cell className="font-medium">
                <Money
                  amount={transaction.amount}
                  currency={transaction.currencyCode}
                  locale={locale}
                  className="font-semibold"
                />
              </Table.Cell>
              <Table.Cell className="table-cell md:hidden">
                <div className="mr-5 flex justify-end md:hidden">
                  <Dropdown inline>
                    <Dropdown.Item disabled={isEditing === transaction.id} onClick={() => editHandler(transaction)}>
                      {t('Generics.edit')}
                    </Dropdown.Item>
                    <Dropdown.Item disabled={isDeleting === transaction.id} onClick={() => deleteHandler(transaction)}>
                      {t('Generics.delete')}
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              </Table.Cell>
              <Table.Cell className="hidden w-min md:table-cell">
                <div className="flex flex-col items-end justify-end gap-1 lg:flex-row lg:gap-2">
                  {isEditing !== transaction.id && (
                    <Button
                      className="mb-2 min-w-28 lg:mb-0"
                      size="sm"
                      title={t('Generics.edit')}
                      variant={ButtonVariant.Secondary}
                      onClick={() => editHandler(transaction)}
                    >
                      <HiPencil className="mr-1 size-5" />
                      {t('Generics.edit')}
                    </Button>
                  )}
                  {isEditing === transaction.id && (
                    <Button className="mb-2 lg:mb-0" size="sm" variant={ButtonVariant.Secondary} isProcessing>
                      {t('Generics.editing')}
                    </Button>
                  )}
                  {isDeleting !== transaction.id && (
                    <Button
                      size="sm"
                      title={t('Generics.delete')}
                      className="min-w-28"
                      variant={ButtonVariant.Critical}
                      onClick={() => deleteHandler(transaction)}
                    >
                      <HiTrash className="mr-1 size-5" />
                      {t('Generics.delete')}
                    </Button>
                  )}
                  {isDeleting === transaction.id && (
                    <Button size="sm" variant={ButtonVariant.Critical} isProcessing>
                      {t('Generics.deleting')}
                    </Button>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {showPagination && (
        <div className="flex overflow-x-auto sm:justify-center">
          <Pagination
            currentPage={filters.currentPage}
            totalPages={filters.totalPages}
            onPageChange={(page) => patchFilters({ currentPage: page })}
          />
        </div>
      )}
    </>
  );
};
