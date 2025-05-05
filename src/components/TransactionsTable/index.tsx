'use client';

import { HiTrash, HiPencil, HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components/Button';
import { Money } from '@/components/Money';
import { ToastType } from '@/components/Toast';
import { useToaster } from '@/components/Toast/ToastProvider';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { format, parseISO } from 'date-fns';
import { Dropdown, Pagination, Table } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { ActionResult } from '@/types/viewModel/actionResult';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';

interface Props {
  transactions: TransactionResponse[];
  showPagination?: boolean;
  noTransactionsMessage?: string;
}

export const TransactionsTable = ({
  transactions,
  showPagination = false,
  noTransactionsMessage = 'No transactions',
}: Props) => {
  const { showToast, clearToast } = useToaster();
  const { showTransactionForm, isOpen: openedTransactionForm } = useTransactionForm();
  const { filters, patchFilters } = useTransactionsFilters();
  const [changedTransaction, setChangedTransaction] = useState<ActionResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    if (changedTransaction) {
      showToast(changedTransaction.message, changedTransaction.success ? ToastType.Success : ToastType.Error);
    }
  }, [changedTransaction, showToast, clearToast]);

  useEffect(() => {
    if (!openedTransactionForm) {
      setIsEditing(null);
    }
  }, [openedTransactionForm]);

  const deleteHandler = async (tx: TransactionResponse) => {
    setIsDeleting(tx.id);
    const result = await deleteTransactionById(tx.id);
    setChangedTransaction(result);
    setIsDeleting(null);
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
          title="Add"
          onClick={() => {
            showTransactionForm();
          }}
        >
          <HiPlus className="mr-1 size-5" />
          <div className="hidden md:block">New</div>
        </Button>
        <p className="text-center text-slate-800 dark:text-white">{noTransactionsMessage}</p>
      </div>
    );
  }

  return (
    <>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Account</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">Category</Table.HeadCell>
          <Table.HeadCell className="hidden lg:table-cell">subcategory</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell className="flex justify-end">
            <Button
              size="sm"
              variant={ButtonVariant.Primary}
              className="w-min md:min-w-28"
              title="Add"
              onClick={() => {
                showTransactionForm();
              }}
            >
              <HiPlus className="mr-1 size-5" />
              <div className="hidden md:block">New</div>
            </Button>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-base">
          {transactions.map((transaction) => (
            <Table.Row key={transaction.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <span className="flex items-center gap-2">
                  {AVAILABLE_ICONS.has(transaction.category.iconName) &&
                    React.createElement(AVAILABLE_ICONS.get(transaction.category.iconName)!)}
                  {transaction.description}
                </span>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {transaction.accountName}
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">{transaction.category.name}</Table.Cell>
              <Table.Cell className="hidden lg:table-cell">{transaction.subcategory.name}</Table.Cell>
              <Table.Cell className="md:hidden">{format(parseISO(transaction.eventDate), 'P')}</Table.Cell>
              <Table.Cell className="hidden md:table-cell">{format(parseISO(transaction.eventDate), 'PP')}</Table.Cell>
              <Table.Cell className="font-medium">
                <Money amount={transaction.amount} currency={transaction.currencyCode} />
              </Table.Cell>
              <Table.Cell className="table-cell md:hidden">
                <div className="mr-5 flex justify-end md:hidden">
                  <Dropdown inline>
                    <Dropdown.Item disabled={isEditing === transaction.id} onClick={() => editHandler(transaction)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item disabled={isDeleting === transaction.id} onClick={() => deleteHandler(transaction)}>
                      Delete
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
                      title="Edit"
                      variant={ButtonVariant.Secondary}
                      onClick={() => editHandler(transaction)}
                    >
                      <HiPencil className="mr-1 size-5" />
                      Edit
                    </Button>
                  )}
                  {isEditing === transaction.id && (
                    <Button className="mb-2 lg:mb-0" size="sm" variant={ButtonVariant.Secondary} isProcessing>
                      Editing
                    </Button>
                  )}
                  {isDeleting !== transaction.id && (
                    <Button
                      size="sm"
                      title="Delete"
                      className="min-w-28"
                      variant={ButtonVariant.Critical}
                      onClick={() => deleteHandler(transaction)}
                    >
                      <HiTrash className="mr-1 size-5" />
                      Delete
                    </Button>
                  )}
                  {isDeleting === transaction.id && (
                    <Button size="sm" variant={ButtonVariant.Critical} isProcessing>
                      Deleting
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
