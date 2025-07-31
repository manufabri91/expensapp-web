'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { ToastType } from '@/components/Toast';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { SubCategoryResponse, TransactionResponse } from '@/types/dto';
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
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategoryResponse[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (transactionFormData) {
      setSelectedCategory(transactionFormData.category.id);
      setSelectedSubcategory(transactionFormData.subcategory.id);
      setSelectedDate(parseISO(transactionFormData.eventDate));
    }
  }, [transactionFormData]);

  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setSelectedDate(null);
      setFilteredSubcategories([]);
    }
  }, [isOpen]);

  // execute when submit
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
    const validSubcategories = subcategories.filter(
      (subcategory) => subcategory.parentCategoryId === Number(event.target.value)
    );
    setFilteredSubcategories(validSubcategories);
    setSelectedSubcategory(validSubcategories[0]?.id || undefined);
  };

  const onSelectedSubcategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubcategory(Number(event.target.value));
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProcessing(true);
    try {
      if (!transactionFormData) {
        const createdTx = await createTransaction(formData);
        setCreatedTransaction(createdTx);
      } else {
        const updatedTx = await editTransaction(formData);
        setEditedTransaction(updatedTx);
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, ToastType.Error);
      } else {
        showToast('An unexpected error occurred', ToastType.Error);
      }
      setEditedTransaction(null);
      setCreatedTransaction(null);
      setProcessing(false);
      closeTransactionForm();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="md" onClose={closeTransactionForm} popup>
      <Modal.Header as={'div'} className="m-4">
        <h3>{transactionFormData ? 'Edit ' : 'Create '}transaction</h3>
      </Modal.Header>
      <Modal.Body>
        <form className="flex max-w-md flex-col gap-4" onSubmit={submitHandler}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="type" value="Is Income or Expense?" />
            </div>
            <Select id="type" name="type" defaultValue={transactionFormData?.type ?? TransactionType.EXPENSE} required>
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </Select>
          </div>
          <div className="hidden">
            <div className="mb-2 block">
              <Label htmlFor="id" value="ID" />
            </div>
            <TextInput id="id" name="id" type="text" value={transactionFormData?.id} readOnly shadow />
          </div>
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
              <Label htmlFor="account" value="Account" />
            </div>
            <Select
              id="account"
              name="account"
              defaultValue={transactionFormData?.accountId ?? accounts[0]?.id}
              required
            >
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
              defaultValue={transactionFormData?.category.id ?? undefined}
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
              disabled={!selectedCategory}
              onChange={onSelectedSubcategory}
              value={selectedSubcategory}
            >
              <option value={undefined}>Select Sub-Category</option>
              {filteredSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </Select>
          </div>

          {!processing && (
            <Button type="submit" variant={ButtonVariant.Primary}>
              {transactionFormData ? 'Edit' : 'Create'}
            </Button>
          )}
          {processing && (
            <Button type="button" variant={ButtonVariant.Primary} isProcessing disabled>
              {transactionFormData ? 'Editing...' : 'Creating...'}
            </Button>
          )}
        </form>
      </Modal.Body>
    </Modal>
  );
};
