'use client';

import { Button, ButtonVariant } from '@/components';
import { ToastType } from '@/components/Toast';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { SubCategoryResponse, TransactionResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';
import { getCurrencySymbol } from '@/utils/currency';
import { formatISO, parseISO } from 'date-fns';

import { Checkbox, Datepicker, Label, Modal, Select, TextInput } from 'flowbite-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

export const TransactionForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAccount, setSelectedAccount] = useState<number>(accounts[0]?.id);
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.EXPENSE);

  const restoreFormState = useCallback(() => {
    setProcessing(false);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedDate(new Date());
    setFilteredSubcategories([]);
    setSelectedAccount(accounts[0]?.id);
    setSelectedType(TransactionType.EXPENSE);
  }, [accounts]);

  useEffect(() => {
    if (transactionFormData) {
      setSelectedCategory(transactionFormData.category.id);
      setSelectedCategory(transactionFormData.category.id);
      const validSubcategories = subcategories.filter(
        (subcategory) => subcategory.parentCategoryId === transactionFormData.category.id
      );
      setFilteredSubcategories(validSubcategories);
      setSelectedSubcategory(transactionFormData.subcategory.id);
      setSelectedDate(parseISO(transactionFormData.eventDate));
      setSelectedAccount(transactionFormData.accountId);
      setSelectedType(transactionFormData.type);
    }
  }, [subcategories, transactionFormData, accounts]);

  useEffect(() => {
    if (!isOpen) {
      restoreFormState();
    }
  }, [isOpen, restoreFormState]);

  // execute when submit
  useEffect(() => {
    if (createdTransaction) {
      showToast(t('TransactionForm.createdSuccess', { id: createdTransaction.id }));
      setCreatedTransaction(null);
      closeTransactionForm();
      restoreFormState();
    } else if (editedTransaction) {
      showToast(t('TransactionForm.editedSuccess', { id: editedTransaction.id }));
      setEditedTransaction(null);
      closeTransactionForm();
      restoreFormState();
    }
  }, [accounts, closeTransactionForm, createdTransaction, editedTransaction, restoreFormState, showToast, t]);

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

  const onAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(Number(event.target.value));
  };

  const onTypeChange = (type: TransactionType) => {
    if (type === TransactionType.TRANSFER) {
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setFilteredSubcategories([]);
    } else {
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
    }
    setSelectedType(type);
  };

  const onDateChanged = (date: Date | null) => {
    setSelectedDate(date ?? new Date());
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('eventDate', formatISO(selectedDate, { representation: 'date' }));
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
        showToast(t('TransactionForm.unexpectedError'), ToastType.Error);
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
        <h3>
          {transactionFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.transaction.singular')}
        </h3>
      </Modal.Header>
      <Modal.Body>
        <form className="flex max-w-md flex-col gap-4" onSubmit={submitHandler}>
          <div className="hidden">
            <div className="mb-2 block">
              <Label htmlFor="id" value="ID" />
            </div>
            <TextInput id="id" name="id" type="text" value={transactionFormData?.id} readOnly shadow />
          </div>
          <div>
            <TransactionTypeSelector initialValue={selectedType} onSelect={onTypeChange} />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="amount" value={t('Generics.amount')} />
            </div>
            <TextInput
              theme={{
                addon:
                  'inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-slate-300 px-3 text-lg font-medium text-gray-900 dark:border-gray-600 dark:bg-slate-800 dark:text-stone-100',
              }}
              id="amount"
              name="amount"
              type="number"
              addon={getCurrencySymbol(locale, accounts.find((acc) => acc.id === selectedAccount)?.currency ?? '')}
              defaultValue={transactionFormData && Math.abs(transactionFormData.amount)}
              min="0"
              step=".01"
              required
              shadow
            />
          </div>

          {selectedType !== TransactionType.TRANSFER && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="excludeFromTotals"
                name="excludeFromTotals"
                defaultChecked={transactionFormData?.excludeFromTotals ?? false}
              />
              <Label htmlFor="excludeFromTotals" className="flex">
                {t('TransactionForm.excludeFromTotals')}
              </Label>
            </div>
          )}

          {selectedType !== TransactionType.TRANSFER && (
            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="account" value={t('Generics.account')} />
              </div>
              <Select
                id="account"
                name="account"
                defaultValue={transactionFormData?.accountId ?? accounts[0]?.id}
                required
                onChange={onAccountChange}
              >
                <option value={undefined}>{t('TransactionForm.selectAccount')}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {selectedType === TransactionType.TRANSFER && (
            <>
              <div className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="account" value={t('TransactionForm.originAccount')} />
                </div>
                <Select
                  id="account"
                  name="account"
                  defaultValue={
                    (transactionFormData && transactionFormData.subcategory.name === 'TRANSFER.OUT.SUBCATEGORY'
                      ? transactionFormData?.accountId
                      : transactionFormData?.linkedTransaction?.accountId) ?? accounts[0]?.id
                  }
                  required
                  onChange={onAccountChange}
                >
                  <option value={undefined}>{t('TransactionForm.selectAccount')}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="destinationAccount" value={t('TransactionForm.destinationAccount')} />
                </div>
                <Select
                  id="destinationAccount"
                  name="destinationAccount"
                  defaultValue={
                    transactionFormData && transactionFormData.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
                      ? transactionFormData?.accountId
                      : transactionFormData?.linkedTransaction?.accountId
                  }
                  required
                >
                  <option value={undefined}>{t('TransactionForm.selectAccount')}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
          {selectedType !== TransactionType.TRANSFER && (
            <div>
              <div className="mb-2 block">
                <Label htmlFor="description" value={t('Generics.description')} />
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
          )}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="eventDate" value={t('Generics.date')} />
            </div>
            <Datepicker
              language={locale}
              title={t('TransactionForm.eventDate')}
              id="eventDate"
              name="eventDate"
              value={selectedDate}
              onChange={onDateChanged}
              shadow
              required
            />
          </div>
          {selectedType !== TransactionType.TRANSFER && (
            <>
              <div className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="category" value={t('Generics.category')} />
                </div>
                <Select
                  id="category"
                  name="category"
                  defaultValue={transactionFormData?.category.id ?? undefined}
                  required
                  onChange={onSelectedCategory}
                >
                  <option value={undefined}>{t('TransactionForm.selectCategory')}</option>
                  {categories
                    .filter((cat) => cat.type === selectedType)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </Select>
              </div>

              <div className="max-w-md">
                <div className="mb-2 block">
                  <Label htmlFor="subcategory" value={t('Generics.subcategory')} />
                </div>
                <Select
                  id="subcategory"
                  name="subcategory"
                  required
                  disabled={!selectedCategory}
                  onChange={onSelectedSubcategory}
                  value={selectedSubcategory}
                >
                  <option value={undefined}>{t('TransactionForm.selectSubcategory')}</option>
                  {filteredSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {trySystemTranslations(subcategory.name)}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
          {!processing && (
            <Button type="submit" variant={ButtonVariant.Primary}>
              {transactionFormData ? t('Generics.edit') : t('Generics.save')}
            </Button>
          )}
          {processing && (
            <Button type="button" variant={ButtonVariant.Primary} isProcessing disabled>
              {transactionFormData ? t('Generics.editing') : t('Generics.saving')}...
            </Button>
          )}
        </form>
      </Modal.Body>
    </Modal>
  );
};
