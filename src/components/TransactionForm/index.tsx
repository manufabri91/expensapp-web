'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { AccountResponse, CategoryResponse, SubCategoryResponse, TransactionResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';
import { parseISO } from 'date-fns';

import { Datepicker, Label, Select, TextInput } from 'flowbite-react';
import { useState } from 'react';

interface Props {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  subcategories: SubCategoryResponse[];
  submitHandler: (transaction: FormData) => void;
  transaction?: TransactionResponse;
  transactionType?: TransactionType;
}

export const TransactionForm = ({
  accounts,
  categories,
  subcategories,
  submitHandler,
  transaction,
  transactionType = TransactionType.EXPENSE,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState(transaction?.category.id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    transaction?.eventDate ? parseISO(transaction?.eventDate) : null
  );
  const onSelectedCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(Number(event.target.value));
  };

  return (
    <form className="flex max-w-md flex-col gap-4" action={submitHandler}>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="type" value="Is Income or Expense?" />
        </div>
        <Select id="type" name="type" defaultValue={transactionType} required>
          <option value={TransactionType.EXPENSE}>Expense</option>
          <option value={TransactionType.INCOME}>Income</option>
        </Select>
      </div>
      {!!transaction && (
        <div>
          <div className="mb-2 block">
            <Label htmlFor="id" value="ID" />
          </div>
          <TextInput id="id" name="id" type="text" value={transaction?.id} shadow />
        </div>
      )}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="eventDate" value="Date" />
        </div>
        <Datepicker
          title="Event Date"
          id="eventDate"
          name="eventDate"
          value={selectedDate ?? undefined}
          onChange={setSelectedDate}
          shadow
          required
        />
      </div>
      <div className="max-w-md">
        <div className="mb-2 block">
          <Label htmlFor="category" value="Category" />
        </div>
        <Select id="account" name="account" defaultValue={undefined} value={transaction?.accountId} required>
          <option value={undefined}>Select Account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="amount" value="Amount" />
        </div>
        <TextInput id="amount" name="amount" type="number" value={transaction?.amount} required shadow />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="description" value="Description" />
        </div>
        <TextInput id="description" name="description" type="text" value={transaction?.description} required shadow />
      </div>
      <div className="max-w-md">
        <div className="mb-2 block">
          <Label htmlFor="category" value="Category" />
        </div>
        <Select
          id="category"
          name="category"
          defaultValue={undefined}
          value={selectedCategory}
          required
          onChange={onSelectedCategory}
        >
          <option value={undefined}>Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="max-w-md">
        <div className="mb-2 block">
          <Label htmlFor="subcategory" value="Sub-Category" />
        </div>
        <Select
          id="subcategory"
          name="subcategory"
          defaultValue={undefined}
          value={transaction?.subcategory.id}
          disabled={!selectedCategory}
        >
          <option value={undefined}>Select Sub-Category</option>
          {subcategories
            .filter((subcategory) => subcategory.parentCategoryId === selectedCategory)
            .map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
        </Select>
      </div>
      <Button type="submit" variant={ButtonVariant.Primary}>
        Create
      </Button>
    </form>
  );
};
