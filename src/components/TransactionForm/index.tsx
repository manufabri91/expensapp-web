'use client';

import {
  Calendar,
  Checkbox,
  CheckboxGroup,
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
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { formatISO, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionMode, TransactionModeSelector } from '@/components/TransactionModeSelector';
import { getRecentTransactionsCacheKey } from '@/components/TransactionsTable/useInfiniteTransactions';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createRecurringTransaction, editRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { RecurringTransactionResponse, SubCategoryResponse, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';
import { getCurrencySymbol } from '@/utils/currency';

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

interface TransactionDatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const TransactionDatePicker = ({ label, value, onChange }: TransactionDatePickerProps) => (
  <DatePicker
    granularity="day"
    value={fromDate(value, getLocalTimeZone())}
    onChange={(date: { toDate: () => Date } | null) => onChange(date?.toDate() ?? new Date())}
    isRequired
  >
    <Label>{label}</Label>
    <DateField.Group fullWidth variant="secondary">
      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      <DateField.Suffix>
        <DatePicker.Trigger>
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
    <DatePicker.Popover>
      <Calendar aria-label={label}>
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
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
);

export const TransactionForm = () => {
  const { mutate } = useSWRConfig();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const trySystemTranslations = useTrySystemTranslations();
  const { overlayState } = useTransactionForm();
  const { transactionFormData, recurringFormData, formMode, clearForm } = useTransactionForm();
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const { filters } = useTransactionsFilters();
  const [createdTransaction, setCreatedTransaction] = useState<TransactionResponse | null>(null);
  const [editedTransaction, setEditedTransaction] = useState<TransactionResponse | null>(null);
  const [createdRecurring, setCreatedRecurring] = useState<RecurringTransactionResponse | null>(null);
  const [editedRecurring, setEditedRecurring] = useState<RecurringTransactionResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<TransactionMode>('oneTime');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategoryResponse[]>(subcategories);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccount, setSelectedAccount] = useState<number>(accounts[0]?.id);
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [selectedFrequency, setSelectedFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.INTERVAL_DAYS);
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<Set<number>>(new Set());
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [hasEndDate, setHasEndDate] = useState(false);

  const isEditingExisting = !!transactionFormData || !!recurringFormData;
  const selectedAccountObj = accounts.find((acc) => acc.id === selectedAccount);

  const revalidateTransactions = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transaction'), undefined, { revalidate: true });

  const revalidateRecurringTransactions = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/recurring-transaction'), undefined, {
      revalidate: true,
    });

  const insertIntoRecentTransactions = (transaction: TransactionResponse) => {
    mutate<PagedResponse<TransactionResponse>[]>(
      getRecentTransactionsCacheKey(filters),
      (pages) => {
        if (!pages || pages.length === 0) return pages;
        const [firstPage, ...rest] = pages;
        return [
          { ...firstPage, content: [transaction, ...firstPage.content], totalElements: firstPage.totalElements + 1 },
          ...rest,
        ];
      },
      { revalidate: true }
    );
  };

  const updateRecentTransactions = (transaction: TransactionResponse) => {
    mutate<PagedResponse<TransactionResponse>[]>(
      getRecentTransactionsCacheKey(filters),
      (pages) =>
        pages?.map((page) => ({
          ...page,
          content: page.content.map((item) => (item.id === transaction.id ? transaction : item)),
        })),
      { revalidate: true }
    );
  };

  const restoreFormState = useCallback(() => {
    setProcessing(false);
    setMode('oneTime');
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setSelectedDate(new Date());
    setFilteredSubcategories(subcategories);
    setSelectedAccount(accounts[0]?.id);
    setSelectedType(TransactionType.EXPENSE);
    setSelectedFrequency(RecurrenceFrequency.INTERVAL_DAYS);
    setSelectedDaysOfMonth(new Set());
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setHasEndDate(false);
  }, [accounts]);

  const applyCategorySelection = useCallback(
    (categoryId: number, subcategoryId: number) => {
      setSelectedCategory(categoryId);
      setFilteredSubcategories(subcategories.filter((subcategory) => subcategory.parentCategoryId === categoryId));
      setSelectedSubcategory(subcategoryId);
    },
    [subcategories]
  );

  useEffect(() => {
    if (overlayState.isOpen) {
      setMode(formMode);
    }
  }, [overlayState.isOpen, formMode]);

  useEffect(() => {
    if (transactionFormData) {
      setSelectedType(transactionFormData.type);
      applyCategorySelection(transactionFormData.category.id, transactionFormData.subcategory.id);
      setSelectedDate(parseISO(transactionFormData.eventDate));
      setSelectedAccount(transactionFormData.accountId);
    }
  }, [transactionFormData, applyCategorySelection]);

  useEffect(() => {
    if (recurringFormData) {
      setSelectedType(recurringFormData.type);
      applyCategorySelection(recurringFormData.category.id, recurringFormData.subcategory.id);
      setSelectedAccount(recurringFormData.accountId);
      setSelectedFrequency(recurringFormData.frequency);
      setSelectedDaysOfMonth(new Set(recurringFormData.daysOfMonth ?? []));
      setSelectedStartDate(parseISO(recurringFormData.startDate));
      if (recurringFormData.endDate) {
        setHasEndDate(true);
        setSelectedEndDate(parseISO(recurringFormData.endDate));
      } else {
        setHasEndDate(false);
      }
    }
  }, [recurringFormData, applyCategorySelection]);

  useEffect(() => {
    if (!overlayState.isOpen) {
      restoreFormState();
    }
  }, [overlayState.isOpen, restoreFormState]);

  const finishSuccessfully = useCallback(
    (message: string, revalidate: () => void) => {
      toast.success(message);
      clearForm();
      restoreFormState();
      revalidate();
      router.refresh();
    },
    [clearForm, restoreFormState, router]
  );

  // execute when submit
  useEffect(() => {
    if (createdTransaction) {
      finishSuccessfully(t('TransactionForm.createdSuccess', { id: createdTransaction.id }), revalidateTransactions);
      insertIntoRecentTransactions(createdTransaction);
      setCreatedTransaction(null);
    } else if (editedTransaction) {
      finishSuccessfully(t('TransactionForm.editedSuccess', { id: editedTransaction.id }), revalidateTransactions);
      updateRecentTransactions(editedTransaction);
      setEditedTransaction(null);
    } else if (createdRecurring) {
      // A recurrence due today (interval starting today, or a monthly day matching today) has its
      // first transaction generated synchronously by the backend as part of this same request, so
      // the transactions table's own cache needs revalidating too, not just the recurring list's.
      finishSuccessfully(t('TransactionForm.recurringCreatedSuccess', { id: createdRecurring.id }), () => {
        revalidateRecurringTransactions();
        revalidateTransactions();
      });
      setCreatedRecurring(null);
    } else if (editedRecurring) {
      finishSuccessfully(
        t('TransactionForm.recurringEditedSuccess', { id: editedRecurring.id }),
        revalidateRecurringTransactions
      );
      setEditedRecurring(null);
    }
  }, [createdTransaction, editedTransaction, createdRecurring, editedRecurring, finishSuccessfully, t]);

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

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>, cb?: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProcessing(true);
    try {
      if (mode === 'recurring') {
        formData.set('frequency', selectedFrequency);
        formData.set('startDate', formatISO(selectedStartDate, { representation: 'date' }));
        formData.delete('endDate');
        if (hasEndDate) {
          formData.set('endDate', formatISO(selectedEndDate, { representation: 'date' }));
        }
        formData.delete('daysOfMonth');
        selectedDaysOfMonth.forEach((day) => formData.append('daysOfMonth', day.toString()));

        if (!recurringFormData) {
          const created = await createRecurringTransaction(formData);
          setCreatedRecurring(created);
        } else {
          formData.set('id', String(recurringFormData.id));
          const updated = await editRecurringTransaction(formData);
          setEditedRecurring(updated);
        }
      } else {
        formData.set('eventDate', formatISO(selectedDate, { representation: 'date' }));
        if (!transactionFormData) {
          const createdTx = await createTransaction(formData);
          setCreatedTransaction(createdTx);
        } else {
          const updatedTx = await editTransaction(formData);
          setEditedTransaction(updatedTx);
        }
      }
      if (cb) cb();
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('TransactionForm.unexpectedError'));
      }
      setEditedTransaction(null);
      setCreatedTransaction(null);
      setEditedRecurring(null);
      setCreatedRecurring(null);
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
              {isEditingExisting ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.transaction.singular')}
            </Modal.Heading>
          </Modal.Header>
          <form onSubmit={(e) => submitHandler(e, () => overlayState.close())}>
            <Modal.Body className="flex flex-col gap-4">
              <input
                id="id"
                name="id"
                type="hidden"
                value={`${mode === 'recurring' ? recurringFormData?.id : transactionFormData?.id}`}
                readOnly
              />
              {!isEditingExisting && (
                <div>
                  <TransactionModeSelector initialValue={mode} onSelect={setMode} />
                </div>
              )}
              <div>
                <TransactionTypeSelector
                  initialValue={selectedType}
                  onSelect={onTypeChange}
                  hideTransfers={mode === 'recurring'}
                />
              </div>
              <NumberField
                defaultValue={
                  transactionFormData?.amount
                    ? Number(Math.abs(transactionFormData.amount).toFixed(2))
                    : (recurringFormData?.amount ?? 0)
                }
                name="amount"
                fullWidth
                isRequired
                variant="secondary"
              >
                <Label>{t('Generics.amount')}</Label>
                <InputGroup variant="secondary" fullWidth>
                  {selectedAccountObj && (
                    <InputGroup.Prefix>{getCurrencySymbol(locale, selectedAccountObj.currency)}</InputGroup.Prefix>
                  )}
                  <InputGroup.Input />
                </InputGroup>
              </NumberField>
              {selectedType !== TransactionType.TRANSFER && (
                <Switch
                  size="sm"
                  name="excludeFromTotals"
                  defaultSelected={transactionFormData?.excludeFromTotals ?? recurringFormData?.excludeFromTotals ?? false}
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
                    defaultSelectedKey={
                      transactionFormData?.accountId.toString() ??
                      recurringFormData?.accountId.toString() ??
                      accounts[0]?.id.toString()
                    }
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
                  <TextField
                    name="description"
                    isRequired
                    defaultValue={transactionFormData?.description ?? recurringFormData?.description}
                    fullWidth
                  >
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

              {mode === 'oneTime' && (
                <TransactionDatePicker label={t('Generics.date')} value={selectedDate} onChange={setSelectedDate} />
              )}

              {mode === 'recurring' && (
                <>
                  <ToggleButtonGroup
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[selectedFrequency]}
                    onSelectionChange={(keys) => {
                      const next = Array.from(keys)[0] as RecurrenceFrequency | undefined;
                      if (next) setSelectedFrequency(next);
                    }}
                  >
                    <ToggleButton id={RecurrenceFrequency.INTERVAL_DAYS}>
                      {t('TransactionForm.frequency.intervalDays')}
                    </ToggleButton>
                    <ToggleButton id={RecurrenceFrequency.MONTHLY_DAYS}>
                      {t('TransactionForm.frequency.monthlyDays')}
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {selectedFrequency === RecurrenceFrequency.INTERVAL_DAYS && (
                    <NumberField
                      name="intervalDays"
                      defaultValue={recurringFormData?.intervalDays ?? 1}
                      minValue={1}
                      fullWidth
                      isRequired
                      variant="secondary"
                    >
                      <Label>{t('TransactionForm.intervalDaysLabel')}</Label>
                      <InputGroup variant="secondary" fullWidth>
                        <InputGroup.Input />
                      </InputGroup>
                    </NumberField>
                  )}

                  {selectedFrequency === RecurrenceFrequency.MONTHLY_DAYS && (
                    <CheckboxGroup
                      value={Array.from(selectedDaysOfMonth)
                        .sort((a, b) => a - b)
                        .map(String)}
                      onChange={(keys: string[]) => setSelectedDaysOfMonth(new Set(keys.map(Number)))}
                    >
                      <Label>{t('TransactionForm.daysOfMonthLabel')}</Label>
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS_OF_MONTH.map((day) => (
                          <Checkbox key={day} value={day.toString()}>
                            <Checkbox.Content>
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <span>{day}</span>
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                      </div>
                    </CheckboxGroup>
                  )}

                  <TransactionDatePicker
                    label={t('TransactionForm.startDate')}
                    value={selectedStartDate}
                    onChange={setSelectedStartDate}
                  />

                  <Switch size="sm" isSelected={!hasEndDate} onChange={(selected: boolean) => setHasEndDate(!selected)}>
                    <Switch.Content>
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <span>{t('TransactionForm.noEndDate')}</span>
                    </Switch.Content>
                  </Switch>

                  {hasEndDate && (
                    <TransactionDatePicker
                      label={t('TransactionForm.endDate')}
                      value={selectedEndDate}
                      onChange={setSelectedEndDate}
                    />
                  )}
                </>
              )}

              {selectedType !== TransactionType.TRANSFER && (
                <>
                  <Select
                    id="category"
                    name="category"
                    defaultSelectedKey={
                      transactionFormData?.category.id.toString() ?? recurringFormData?.category.id.toString()
                    }
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
                      transactionFormData?.subcategory.id
                        ? transactionFormData.subcategory.id.toString()
                        : recurringFormData?.subcategory.id.toString()
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
                  {isEditingExisting ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isDisabled fullWidth>
                  {isEditingExisting ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
