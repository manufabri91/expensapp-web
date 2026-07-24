'use client';

import {
  Calendar,
  DateField,
  DatePicker,
  InputGroup,
  Label,
  ListBox,
  Modal,
  NumberField,
  Select,
  Switch,
  TextField,
  toast,
} from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { formatISO, parseISO } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { isRecentTransactionsFirstPageKey } from '@/components/TransactionsTable/useInfiniteTransactions';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { SubCategoryResponse, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionType } from '@/types/enums/transactionType';
import { getCurrencySymbol } from '@/utils/currency';

export const TransactionForm = () => {
  const { mutate } = useSWRConfig();
  const t = useTranslations();
  const locale = useLocale();
  const trySystemTranslations = useTrySystemTranslations();
  const { overlayState } = useTransactionForm();
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

  const revalidateTransactions = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transaction'), undefined, { revalidate: true });

  const insertIntoRecentTransactions = (transaction: TransactionResponse) => {
    mutate(
      isRecentTransactionsFirstPageKey,
      (page?: PagedResponse<TransactionResponse>) =>
        page && { ...page, content: [transaction, ...page.content], totalElements: page.totalElements + 1 },
      { revalidate: false }
    );
    mutate(isRecentTransactionsFirstPageKey, undefined, { revalidate: true });
  };

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
    if (!overlayState.isOpen) {
      restoreFormState();
    }
  }, [overlayState.isOpen, restoreFormState]);

  // execute when submit
  useEffect(() => {
    if (createdTransaction) {
      toast.success(t('TransactionForm.createdSuccess', { id: createdTransaction.id }));
      setCreatedTransaction(null);
      clearForm();
      restoreFormState();
      revalidateTransactions();
      insertIntoRecentTransactions(createdTransaction);
    } else if (editedTransaction) {
      toast.success(t('TransactionForm.editedSuccess', { id: editedTransaction.id }));
      setEditedTransaction(null);
      clearForm();
      restoreFormState();
      revalidateTransactions();
    }
  }, [accounts, clearForm, createdTransaction, editedTransaction, restoreFormState, t]);

  const onSelectedCategory = (key: React.Key | null) => {
    if (key === null) return;
    const categoryId = Number(key);
    setSelectedCategory(categoryId);
    const validSubcategories = subcategories.filter((subcategory) => subcategory.parentCategoryId === categoryId);
    setFilteredSubcategories(validSubcategories);
    setSelectedSubcategory(validSubcategories[0]?.id);
  };

  const onSelectedSubcategory = (key: React.Key | null) => {
    if (key === null) return;
    setSelectedSubcategory(Number(key));
  };

  const onAccountChange = (key: React.Key | null) => {
    if (key === null) return;
    setSelectedAccount(Number(key));
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
        if (cb) cb();
      } else {
        const updatedTx = await editTransaction(formData);
        setEditedTransaction(updatedTx);
        if (cb) cb();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('TransactionForm.unexpectedError'));
      }
      setEditedTransaction(null);
      setCreatedTransaction(null);
      setProcessing(false);
      clearForm();
      cb?.();
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
      <Modal.Container scroll="outside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {transactionFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.transaction.singular')}
            </Modal.Heading>
          </Modal.Header>
          <form onSubmit={(e) => submitHandler(e, () => overlayState.close())}>
            <Modal.Body className="flex flex-col gap-4">
              <input id="id" name="id" type="hidden" value={`${transactionFormData?.id}`} readOnly />
              <div>
                <TransactionTypeSelector initialValue={selectedType} onSelect={onTypeChange} />
              </div>
              <NumberField
                defaultValue={
                  transactionFormData?.amount ? Number(Math.abs(transactionFormData?.amount).toFixed(2)) : 0
                }
                name="amount"
                fullWidth
                isRequired
                variant="secondary"
              >
                <Label>{t('Generics.amount')}</Label>
                <InputGroup variant="secondary" fullWidth>
                  {accounts.find((acc) => acc.id === selectedAccount) && (
                    <InputGroup.Prefix>
                      {getCurrencySymbol(locale, accounts.find((acc) => acc.id === selectedAccount)!.currency)}
                    </InputGroup.Prefix>
                  )}
                  <InputGroup.Input />
                </InputGroup>
              </NumberField>
              {selectedType !== TransactionType.TRANSFER && (
                <Switch
                  size="sm"
                  name="excludeFromTotals"
                  defaultSelected={transactionFormData?.excludeFromTotals ?? false}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <span>{t('TransactionForm.excludeFromTotals')}</span>
                  </Switch.Content>
                </Switch>
              )}
              {selectedType !== TransactionType.TRANSFER && (
                <>
                  <Select
                    id="account"
                    name="account"
                    defaultSelectedKey={transactionFormData?.accountId.toString() ?? accounts[0]?.id.toString()}
                    isRequired
                    onSelectionChange={onAccountChange}
                    variant="secondary"
                  >
                    <Label>{t('Generics.account')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {accounts.map((account) => (
                          <ListBox.Item key={account.id} id={account.id.toString()} textValue={account.name}>
                            {account.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <TextField name="description" isRequired defaultValue={transactionFormData?.description} fullWidth>
                    <Label>{t('Generics.description')}</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.Input id="description" type="text" />
                    </InputGroup>
                  </TextField>
                </>
              )}
              {selectedType === TransactionType.TRANSFER && (
                <>
                  <Select
                    id="account"
                    name="account"
                    defaultSelectedKey={transactionFormData?.accountId.toString() ?? accounts[0]?.id.toString()}
                    isRequired
                    onSelectionChange={onAccountChange}
                    placeholder={t('TransactionForm.selectAccount')}
                    variant="secondary"
                  >
                    <Label>{t('Generics.account')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {accounts.map((account) => (
                          <ListBox.Item key={account.id} id={account.id.toString()} textValue={account.name}>
                            {account.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  <Select
                    id="destinationAccount"
                    name="destinationAccount"
                    defaultSelectedKey={
                      transactionFormData && transactionFormData.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
                        ? transactionFormData.accountId.toString()
                        : (transactionFormData?.linkedTransaction?.accountId.toString() ?? '')
                    }
                    isRequired
                    placeholder={t('TransactionForm.selectAccount')}
                    variant="secondary"
                  >
                    <Label>{t('TransactionForm.destinationAccount')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {accounts.map((account) => (
                          <ListBox.Item key={account.id} id={account.id.toString()} textValue={account.name}>
                            {account.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </>
              )}

              <DatePicker
                name="eventDate"
                granularity="day"
                defaultValue={fromDate(selectedDate, getLocalTimeZone())}
                value={fromDate(selectedDate, getLocalTimeZone())}
                onChange={(date: { toDate: () => Date } | null) => {
                  onDateChanged(date?.toDate());
                }}
                isRequired
              >
                <Label>{t('Generics.date')}</Label>
                <DateField.Group fullWidth variant="secondary">
                  <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger>
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover>
                  <Calendar aria-label={t('Generics.date')}>
                    <Calendar.Header>
                      <Calendar.YearPickerTrigger>
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <Calendar.NavButton slot="previous" />
                      <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                      <Calendar.GridHeader>
                        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                    </Calendar.Grid>
                    <Calendar.YearPickerGrid>
                      <Calendar.YearPickerGridBody>
                        {({ year }) => <Calendar.YearPickerCell year={year} />}
                      </Calendar.YearPickerGridBody>
                    </Calendar.YearPickerGrid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>
              {selectedType !== TransactionType.TRANSFER && (
                <>
                  <Select
                    id="category"
                    name="category"
                    defaultSelectedKey={transactionFormData ? transactionFormData.category.id.toString() : undefined}
                    isRequired
                    onSelectionChange={onSelectedCategory}
                    placeholder={t('TransactionForm.selectCategory')}
                    variant="secondary"
                  >
                    <Label>{t('Generics.category')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {categories.map((category) => (
                          <ListBox.Item
                            key={category.id}
                            id={category.id.toString()}
                            textValue={category.name}
                            hidden={category.type !== selectedType}
                          >
                            {category.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>

                  <Select
                    id="subcategory"
                    name="subcategory"
                    isRequired
                    defaultSelectedKey={
                      transactionFormData?.subcategory.id ? transactionFormData.subcategory.id.toString() : undefined
                    }
                    isDisabled={!selectedCategory}
                    onSelectionChange={onSelectedSubcategory}
                    selectedKey={selectedSubcategory?.toString()}
                    placeholder={t('TransactionForm.selectSubcategory')}
                    variant="secondary"
                  >
                    <Label>{t('Generics.subcategory')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {filteredSubcategories.map((subcategory) => (
                          <ListBox.Item
                            key={subcategory.id}
                            id={subcategory.id.toString()}
                            textValue={trySystemTranslations(subcategory.name)}
                          >
                            {trySystemTranslations(subcategory.name)}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              {!processing && (
                <Button type="submit" variant="primary" fullWidth>
                  {transactionFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isDisabled fullWidth>
                  {transactionFormData ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
