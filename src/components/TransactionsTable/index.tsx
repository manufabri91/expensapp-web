'use client';

import { HiTrash, HiPencil, HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components/Button';
import { Money } from '@/components/Money';
import { ToastType } from '@/components/Toast';
import { useToaster } from '@/components/Toast/ToastProvider';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { format, parseISO } from 'date-fns';
import { Dropdown, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { ActionResult } from '@/types/viewModel/actionResult';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';

interface Props {
  transactions: TransactionResponse[];
}

export const TransactionsTable = ({ transactions }: Props) => {
  const { showToast, clearToast } = useToaster();
  const { showTransactionForm, isOpen: openedTransactionForm } = useTransactionForm();
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

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Account</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">Category</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">subcategory</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell className="w-min">
            <Button
              variant={ButtonVariant.Primary}
              onClick={() => {
                showTransactionForm();
              }}
            >
              <HiPlus className="mr-1 size-5" />
              Add
            </Button>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-base">
          {transactions.map((transaction) => (
            <Table.Row key={transaction.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {transaction.description}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {transaction.accountName}
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">{transaction.category.name}</Table.Cell>
              <Table.Cell className="hidden md:table-cell">{transaction.subcategory.name}</Table.Cell>
              <Table.Cell className="md:hidden">{format(parseISO(transaction.eventDate), 'PP')}</Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {format(parseISO(transaction.eventDate), 'PPpp')}
              </Table.Cell>
              <Table.Cell className="font-medium">
                <Money amount={transaction.amount} currency={transaction.currencyCode} />
              </Table.Cell>
              <Table.Cell className="table-cell md:hidden">
                <Dropdown label="" inline className="block md:hidden">
                  <Dropdown.Item disabled={isEditing === transaction.id} onClick={() => editHandler(transaction)}>
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item disabled={isDeleting === transaction.id} onClick={() => deleteHandler(transaction)}>
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              </Table.Cell>
              <Table.Cell className="hidden w-min md:table-cell">
                <div className="flex gap-2">
                  {isEditing !== transaction.id && (
                    <Button variant={ButtonVariant.Secondary} onClick={() => editHandler(transaction)}>
                      <HiPencil className="mr-1 size-5" />
                      Edit
                    </Button>
                  )}
                  {isEditing === transaction.id && (
                    <Button variant={ButtonVariant.Secondary} isProcessing>
                      Edit
                    </Button>
                  )}
                  {isDeleting !== transaction.id && (
                    <Button variant={ButtonVariant.Critical} onClick={() => deleteHandler(transaction)}>
                      <HiTrash className="mr-1 size-5" />
                      Delete
                    </Button>
                  )}
                  {isDeleting === transaction.id && (
                    <Button variant={ButtonVariant.Critical} isProcessing>
                      Delete
                    </Button>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
