'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { Money } from '@/components/Money';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto/transactionResponse';
import { format, parseISO } from 'date-fns';
import { Dropdown, Table } from 'flowbite-react';

interface Props {
  transactions: TransactionResponse[];
}

export const TransactionsTable = ({ transactions }: Props) => {
  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">Category</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">subcategory</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y text-base">
          {transactions.map((transaction) => (
            <Table.Row key={transaction.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {transaction.description}
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
                  <Dropdown.Item onClick={() => console.log(transaction.id)}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => deleteTransactionById(transaction.id)}>Delete</Dropdown.Item>
                </Dropdown>
              </Table.Cell>
              <Table.Cell className="hidden content-center justify-center md:table-cell">
                <div className="flex gap-4">
                  <Button variant={ButtonVariant.Secondary} onClick={() => console.log(transaction.id)}>
                    Edit
                  </Button>
                  <Button variant={ButtonVariant.Critical} onClick={() => deleteTransactionById(transaction.id)}>
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
