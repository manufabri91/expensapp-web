'use client';

import { DatePicker } from '@heroui/date-picker';
import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { NumberInput } from '@heroui/number-input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { addToast } from '@heroui/toast';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { formatISO, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { SubCategoryResponse, TransactionResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';

export const TransactionForm = () => {
  const t = useTranslations();
  const trySystemTranslations = useTrySystemTranslations();
  const { onOpenChange, isOpen } = useTransactionForm();
  const { transactionFormData, clearForm } = useTransactionForm();
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const [createdTransaction, setCreatedTransaction] = useState<TransactionResponse | null>(null);
  const [editedTransaction, setEditedTransaction] = useState<TransactionResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategoryResponse[]>(subcategories);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccount, setSelectedAccount] = useState<number>(accounts[0]?.id);
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.EXPENSE);

  const restoreFormState = useCallback(() => {
    setProcessing(false);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedDate(new Date());
    setFilteredSubcategories(subcategories);
    setSelectedAccount(accounts[0]?.id);
    setSelectedType(TransactionType.EXPENSE);
  }, [accounts]);

  useEffect(() => {
    if (transactionFormData) {
      setSelectedType(transactionFormData.type);
      setSelectedCategory(transactionFormData.category.id);
      setSelectedCategory(transactionFormData.category.id);
      const validSubcategories = subcategories.filter(
        (subcategory) => subcategory.parentCategoryId === transactionFormData.category.id
      );
      setFilteredSubcategories(validSubcategories);
      setSelectedSubcategory(transactionFormData.subcategory.id);
      setSelectedDate(parseISO(transactionFormData.eventDate));
      setSelectedAccount(transactionFormData.accountId);
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
      addToast({ title: t('TransactionForm.createdSuccess', { id: createdTransaction.id }), color: 'success' });
      setCreatedTransaction(null);
      clearForm();
      restoreFormState();
    } else if (editedTransaction) {
      addToast({ title: t('TransactionForm.editedSuccess', { id: editedTransaction.id }), color: 'success' });
      setEditedTransaction(null);
      clearForm();
      restoreFormState();
    }
  }, [accounts, clearForm, createdTransaction, editedTransaction, restoreFormState, addToast, t]);

  const onSelectedCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(Number(event.target.value));
    const validSubcategories = subcategories.filter(
      (subcategory) => subcategory.parentCategoryId === Number(event.target.value)
    );
    setFilteredSubcategories(validSubcategories);
    setSelectedSubcategory(validSubcategories[0]?.id);
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
      setFilteredSubcategories(subcategories);
    } else {
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
    }
    setSelectedType(type);
  };

  const onDateChanged = (date?: Date | null) => {
    setSelectedDate(date ?? new Date());
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>, cb?: () => void) => {
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
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('AccountForm.unexpectedError'), color: 'danger' });
      }
      setEditedTransaction(null);
      setCreatedTransaction(null);
      setProcessing(false);
      clearForm();
      cb?.();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {transactionFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.transaction.singular')}
            </ModalHeader>
            <ModalBody>
              <form className="flex max-w-md flex-col gap-4" onSubmit={(e) => submitHandler(e, onClose)}>
                <div className="hidden">
                  <Input id="id" name="id" type="text" value={`${transactionFormData?.id}`} readOnly />
                </div>
                <div>
                  <TransactionTypeSelector initialValue={selectedType} onSelect={onTypeChange} />
                </div>
                <NumberInput
                  defaultValue={
                    transactionFormData?.amount ? Number(Math.abs(transactionFormData?.amount).toFixed(2)) : 0
                  }
                  formatOptions={
                    accounts.find((acc) => acc.id === selectedAccount) && {
                      style: 'currency',
                      currency: accounts.find((acc) => acc.id === selectedAccount)?.currency || '',
                    }
                  }
                  inputMode="decimal"
                  hideStepper
                  label={t('Generics.amount')}
                  id="amount"
                  name="amount"
                  labelPlacement="outside"
                  fullWidth
                  isRequired
                  min="0"
                  step={0.01}
                />
                {selectedType !== TransactionType.TRANSFER && (
                  <Switch
                    size="sm"
                    id="excludeFromTotals"
                    name="excludeFromTotals"
                    defaultSelected={transactionFormData?.excludeFromTotals ?? false}
                  >
                    {t('TransactionForm.excludeFromTotals')}
                  </Switch>
                )}
                {selectedType !== TransactionType.TRANSFER && (
                  <>
                    <Select
                      label={t('Generics.account')}
                      id="account"
                      name="account"
                      defaultSelectedKeys={transactionFormData?.accountId.toString() ?? accounts[0]?.id.toString()}
                      value={transactionFormData?.accountId ?? accounts[0]?.id}
                      isRequired
                      labelPlacement="outside"
                      onChange={onAccountChange}
                    >
                      {accounts.map((account) => (
                        <SelectItem key={account.id}>{account.name}</SelectItem>
                      ))}
                    </Select>
                    <Input
                      id="description"
                      name="description"
                      fullWidth
                      isRequired
                      labelPlacement="outside-top"
                      label={t('Generics.description')}
                      defaultValue={transactionFormData?.description}
                    />
                  </>
                )}
                {selectedType === TransactionType.TRANSFER && (
                  <>
                    <Select
                      label={t('Generics.account')}
                      id="account"
                      name="account"
                      defaultSelectedKeys={transactionFormData?.accountId.toString() ?? accounts[0]?.id.toString()}
                      value={
                        (transactionFormData && transactionFormData.subcategory.name === 'TRANSFER.OUT.SUBCATEGORY'
                          ? transactionFormData?.accountId
                          : transactionFormData?.linkedTransaction?.accountId) ?? accounts[0]?.id
                      }
                      isRequired
                      labelPlacement="outside"
                      onChange={onAccountChange}
                      placeholder={t('TransactionForm.selectAccount')}
                    >
                      {accounts.map((account) => (
                        <SelectItem key={account.id}>{account.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      label={t('TransactionForm.destinationAccount')}
                      id="destinationAccount"
                      name="destinationAccount"
                      defaultSelectedKeys={[
                        transactionFormData && transactionFormData.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
                          ? transactionFormData.accountId.toString()
                          : (transactionFormData?.linkedTransaction?.accountId.toString() ?? ''),
                      ]}
                      isRequired
                      labelPlacement="outside"
                      placeholder={t('TransactionForm.selectAccount')}
                    >
                      {accounts.map((account) => (
                        <SelectItem key={account.id}>{account.name}</SelectItem>
                      ))}
                    </Select>
                  </>
                )}

                <DatePicker
                  id="eventDate"
                  name="eventDate"
                  granularity="day"
                  label={t('Generics.date')}
                  defaultValue={fromDate(selectedDate, getLocalTimeZone())}
                  value={fromDate(selectedDate, getLocalTimeZone())}
                  onChange={(date) => {
                    onDateChanged(date?.toDate());
                  }}
                  selectorButtonPlacement="start"
                  labelPlacement="outside"
                  isRequired
                />
                {selectedType !== TransactionType.TRANSFER && (
                  <>
                    <Select
                      label={t('Generics.category')}
                      id="category"
                      name="category"
                      defaultSelectedKeys={
                        transactionFormData ? [transactionFormData.category.id.toString()] : undefined
                      }
                      isRequired
                      labelPlacement="outside"
                      onChange={onSelectedCategory}
                      placeholder={t('TransactionForm.selectCategory')}
                    >
                      {categories.map((category) => (
                        <SelectItem key={category.id} hidden={category.type !== selectedType}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      label={t('Generics.subcategory')}
                      id="subcategory"
                      name="subcategory"
                      isRequired
                      labelPlacement="outside"
                      defaultSelectedKeys={
                        transactionFormData?.subcategory.id
                          ? [transactionFormData.subcategory.id.toString()]
                          : undefined
                      }
                      disabled={!selectedCategory}
                      onChange={onSelectedSubcategory}
                      value={selectedSubcategory}
                      items={filteredSubcategories}
                      placeholder={t('TransactionForm.selectSubcategory')}
                    >
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id}>{trySystemTranslations(subcategory.name)}</SelectItem>
                      ))}
                    </Select>
                  </>
                )}
                <div className="my-5 flex w-full">
                  {!processing && (
                    <Button type="submit" color="primary" fullWidth>
                      {transactionFormData ? t('Generics.edit') : t('Generics.save')}
                    </Button>
                  )}
                  {processing && (
                    <Button type="button" isLoading disabled fullWidth>
                      {transactionFormData ? t('Generics.editing') : t('Generics.saving')}...
                    </Button>
                  )}
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
