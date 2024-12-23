'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { TransactionResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';
import { parseISO } from 'date-fns';

import { Datepicker, Label, Modal, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';

export const TransactionForm = () => {
  const { showToast } = useToaster();
  const { transactionFormData, isOpen, closeTransactionForm } = useTransactionForm();
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const [createdTransaction, setCreatedTransaction] = useState<TransactionResponse | null>(null);
  const [editedTransaction, setEditedTransaction] = useState<TransactionResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState(transactionFormData?.category.id);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    transactionFormData?.eventDate ? parseISO(transactionFormData?.eventDate) : null
  );

  useEffect(() => {
    if (createdTransaction) {
      showToast(`Created transaction with ID: ${createdTransaction.id}`);
      setCreatedTransaction(null);
      closeTransactionForm();
      setProcessing(false);
    } else if (editedTransaction) {
      showToast(`Edited transaction with ID: ${editedTransaction.id}`);
      setEditedTransaction(null);
      closeTransactionForm();
      setProcessing(false);
    }
  }, [closeTransactionForm, createdTransaction, editedTransaction, showToast]);

  const onSelectedCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(Number(event.target.value));
  };

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    if (!transactionFormData) {
      const createdTx = await createTransaction(formData);
      setCreatedTransaction(createdTx);
    } else {
      const updatedTx = await editTransaction(formData);
      setEditedTransaction(updatedTx);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="md" onClose={closeTransactionForm} popup>
      <Modal.Header as={'div'} className="m-4">
        <h3>{transactionFormData ? 'Edit ' : 'Create '}transaction</h3>
      </Modal.Header>
      <Modal.Body>
        <form className="flex max-w-md flex-col gap-4" action={submitHandler}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="type" value="Is Income or Expense?" />
            </div>
            <Select id="type" name="type" defaultValue={transactionFormData?.type ?? TransactionType.EXPENSE} required>
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </Select>
          </div>
          {!!transactionFormData && (
            <div>
              <div className="mb-2 block">
                <Label htmlFor="id" value="ID" />
              </div>
              <TextInput id="id" name="id" type="text" value={transactionFormData?.id} readOnly shadow />
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
            <Select id="account" name="account" defaultValue={transactionFormData?.accountId} required>
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
            <TextInput
              id="amount"
              name="amount"
              type="number"
              defaultValue={transactionFormData && Math.abs(transactionFormData.amount)}
              min="0"
              step=".01"
              required
              shadow
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="description" value="Description" />
            </div>
            <TextInput
              id="description"
              name="description"
              type="text"
              defaultValue={transactionFormData?.description}
              required
              shadow
            />
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
              required
              defaultValue={transactionFormData?.subcategory.id}
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

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {transactionFormData ? 'Edit' : 'Create'}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
