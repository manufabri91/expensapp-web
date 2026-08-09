'use client';

import {
  Calendar,
  Checkbox,
  CheckboxGroup,
  DateField,
  DatePicker,
  ErrorMessage,
  FieldError,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { isFuture, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, Resolver, useForm, useWatch } from 'react-hook-form';
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
import { oneTimeTransactionSchema, recurringTransactionSchema } from '@/schemas/transaction';
import {
  RecurringTransactionRequest,
  RecurringTransactionResponse,
  TransactionRequest,
  TransactionResponse,
} from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';
import { getCurrencySymbol } from '@/utils/currency';

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);

interface TransactionFormValues {
  id?: number;
  amount: number;
  type: TransactionType;
  account?: number;
  destinationAccount?: number;
  category?: number;
  subcategory?: number;
  description: string;
  excludeFromTotals: boolean;
  eventDate?: Date;
  frequency: RecurrenceFrequency;
  intervalDays?: number;
  daysOfMonth: number[];
  startDate?: Date;
  endDate?: Date;
  hasEndDate: boolean;
}

interface TransactionDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
}

const TransactionDatePicker = ({ label, value, onChange }: TransactionDatePickerProps) => (
  <DatePicker
    granularity="day"
    value={fromDate(value ?? new Date(), getLocalTimeZone())}
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

  const isEditingExisting = !!transactionFormData || !!recurringFormData;

  const buildOneTimeDefaults = useCallback(
    (): TransactionFormValues => ({
      id: undefined,
      amount: 0,
      type: TransactionType.EXPENSE,
      account: accounts[0]?.id,
      destinationAccount: undefined,
      category: undefined,
      subcategory: undefined,
      description: '',
      excludeFromTotals: false,
      eventDate: new Date(),
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: 1,
      daysOfMonth: [],
      startDate: new Date(),
      endDate: new Date(),
      hasEndDate: false,
    }),
    [accounts]
  );

  const buildRecurringDefaults = useCallback(
    (): TransactionFormValues => ({
      ...buildOneTimeDefaults(),
      eventDate: undefined,
    }),
    [buildOneTimeDefaults]
  );

  const buildOneTimeDefaultsFromTransaction = useCallback(
    (transaction: TransactionResponse): TransactionFormValues => ({
      id: transaction.id,
      amount: Number(Math.abs(transaction.amount).toFixed(2)),
      type: transaction.type,
      account: transaction.accountId,
      destinationAccount:
        transaction.type === TransactionType.TRANSFER
          ? transaction.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
            ? transaction.accountId
            : transaction.linkedTransaction?.accountId
          : undefined,
      category: transaction.type === TransactionType.TRANSFER ? undefined : transaction.category.id,
      subcategory: transaction.type === TransactionType.TRANSFER ? undefined : transaction.subcategory.id,
      description: transaction.description,
      excludeFromTotals: transaction.excludeFromTotals,
      eventDate: parseISO(transaction.eventDate),
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: 1,
      daysOfMonth: [],
      startDate: new Date(),
      endDate: new Date(),
      hasEndDate: false,
    }),
    []
  );

  const buildRecurringDefaultsFromRecurrence = useCallback(
    (recurrence: RecurringTransactionResponse): TransactionFormValues => ({
      id: recurrence.id,
      amount: recurrence.amount,
      type: recurrence.type,
      account: recurrence.accountId,
      destinationAccount: undefined,
      category: recurrence.category.id,
      subcategory: recurrence.subcategory.id,
      description: recurrence.description,
      excludeFromTotals: recurrence.excludeFromTotals,
      eventDate: undefined,
      frequency: recurrence.frequency,
      intervalDays: recurrence.intervalDays ?? 1,
      daysOfMonth: recurrence.daysOfMonth ?? [],
      startDate: parseISO(recurrence.startDate),
      endDate: recurrence.endDate ? parseISO(recurrence.endDate) : new Date(),
      hasEndDate: !!recurrence.endDate,
    }),
    []
  );

  // `mode` drives which schema the resolver below validates against and which action gets called
  // on submit; it lives outside the schema shape (it's UI routing, not a submitted field), so it's
  // tracked separately rather than as a real RHF field.
  const [mode, setMode] = useState<TransactionMode>(formMode);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: ((values, context, options) => {
      const schema = mode === 'recurring' ? recurringTransactionSchema : oneTimeTransactionSchema;
      return zodResolver(schema)(values as never, context, options as never);
    }) as Resolver<TransactionFormValues>,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: buildOneTimeDefaults(),
  });

  const watchedType = useWatch({ control, name: 'type' });
  const watchedCategory = useWatch({ control, name: 'category' });
  const watchedAccount = useWatch({ control, name: 'account' });
  const watchedFrequency = useWatch({ control, name: 'frequency' });
  const watchedEventDate = useWatch({ control, name: 'eventDate' });
  const watchedHasEndDate = useWatch({ control, name: 'hasEndDate' });
  const watchedDaysOfMonth = useWatch({ control, name: 'daysOfMonth' });

  const selectedAccountObj = accounts.find((acc) => acc.id === watchedAccount);
  const filteredSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.parentCategoryId === watchedCategory),
    [subcategories, watchedCategory]
  );

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

  useEffect(() => {
    if (overlayState.isOpen) setMode(formMode);
  }, [overlayState.isOpen, formMode, setMode]);

  // Tracks whether the user has manually touched the excludeFromTotals switch, so the
  // date-driven auto-default effect below stops overriding it. A ref (rather than RHF's
  // `dirtyFields`) is used deliberately: RHF marks a field dirty as soon as its value differs
  // from its default - including via this same effect's own programmatic `setValue` calls - so
  // `dirtyFields.excludeFromTotals` cannot distinguish "the user touched this" from "the
  // auto-default effect touched this" and would permanently latch after the first auto-update.
  const excludeFromTotalsTouchedRef = useRef(false);

  useEffect(() => {
    if (transactionFormData) {
      setMode('oneTime');
      excludeFromTotalsTouchedRef.current = true;
      reset(buildOneTimeDefaultsFromTransaction(transactionFormData));
    }
  }, [transactionFormData]);

  useEffect(() => {
    if (recurringFormData) {
      setMode('recurring');
      excludeFromTotalsTouchedRef.current = true;
      reset(buildRecurringDefaultsFromRecurrence(recurringFormData));
    }
  }, [recurringFormData]);

  useEffect(() => {
    if (!overlayState.isOpen) {
      excludeFromTotalsTouchedRef.current = false;
      reset(buildOneTimeDefaults());
      setMode('oneTime');
    }
  }, [overlayState.isOpen]);

  useEffect(() => {
    // Also guarded on `isEditingExisting` (not just the touched ref) so this cannot race the
    // hydration effects above: on a hypothetical mount where transactionFormData/recurringFormData
    // is already present on the very first render, this effect's closure would still see the ref
    // as untouched from that same render and could overwrite the seeded value before the
    // hydration effect's own reset() takes effect. Gating on `isEditingExisting` makes it
    // structurally impossible for this effect to touch `excludeFromTotals` while editing,
    // regardless of mount/effect ordering.
    if (mode !== 'oneTime' || excludeFromTotalsTouchedRef.current || isEditingExisting || !watchedEventDate) return;
    setValue('excludeFromTotals', isFuture(watchedEventDate));
  }, [watchedEventDate, mode, isEditingExisting, setValue]);

  const handleModeChange = (nextMode: TransactionMode) => {
    setMode(nextMode);
    excludeFromTotalsTouchedRef.current = false;
    reset(nextMode === 'oneTime' ? buildOneTimeDefaults() : buildRecurringDefaults());
  };

  const finishSuccessfully = useCallback(
    (message: string, revalidate: () => void) => {
      toast.success(message);
      clearForm();
      reset(buildOneTimeDefaults());
      setMode('oneTime');
      revalidate();
      router.refresh();
      overlayState.close();
    },
    [clearForm, reset, buildOneTimeDefaults, setMode, router, overlayState]
  );

  const onValid = async (rawData: TransactionFormValues) => {
    try {
      if (mode === 'recurring') {
        const data = rawData as unknown as RecurringTransactionRequest;
        if (!recurringFormData) {
          const created = await createRecurringTransaction(data);
          finishSuccessfully(t('TransactionForm.recurringCreatedSuccess', { id: created.id }), () => {
            revalidateRecurringTransactions();
            revalidateTransactions();
          });
        } else {
          const updated = await editRecurringTransaction({ ...data, id: recurringFormData.id });
          finishSuccessfully(
            t('TransactionForm.recurringEditedSuccess', { id: updated.id }),
            revalidateRecurringTransactions
          );
        }
      } else {
        const data = rawData as unknown as TransactionRequest;
        if (!transactionFormData) {
          const created = await createTransaction(data);
          finishSuccessfully(t('TransactionForm.createdSuccess', { id: created.id }), revalidateTransactions);
          insertIntoRecentTransactions(created);
        } else {
          const updated = await editTransaction({ ...data, id: transactionFormData.id });
          finishSuccessfully(t('TransactionForm.editedSuccess', { id: updated.id }), revalidateTransactions);
          updateRecentTransactions(updated);
        }
      }
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('TransactionForm.unexpectedError'));
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal>
      <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
        <Modal.Container scroll="outside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isEditingExisting ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.transaction.singular')}
              </Modal.Heading>
            </Modal.Header>
            <form onSubmit={handleSubmit(onValid)}>
              <Modal.Body className="flex flex-col gap-4">
                {!isEditingExisting && (
                  <div>
                    <TransactionModeSelector initialValue={mode} onSelect={handleModeChange} />
                  </div>
                )}
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <div>
                      <TransactionTypeSelector
                        initialValue={field.value}
                        onSelect={(type) => {
                          field.onChange(type);
                          setValue('category', undefined, { shouldDirty: true });
                          setValue('subcategory', undefined, { shouldDirty: true });
                        }}
                        hideTransfers={mode === 'recurring'}
                      />
                      {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <NumberField
                      fullWidth
                      isRequired
                      variant="secondary"
                      isInvalid={fieldState.invalid}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <Label>{t('Generics.amount')}</Label>
                      <InputGroup variant="secondary" fullWidth>
                        {selectedAccountObj && (
                          <InputGroup.Prefix>
                            {getCurrencySymbol(locale, selectedAccountObj.currency)}
                          </InputGroup.Prefix>
                        )}
                        <InputGroup.Input />
                      </InputGroup>
                      {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                    </NumberField>
                  )}
                />
                {watchedType !== TransactionType.TRANSFER && (
                  <Controller
                    control={control}
                    name="excludeFromTotals"
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onChange={(selected: boolean) => {
                          excludeFromTotalsTouchedRef.current = true;
                          field.onChange(selected);
                        }}
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <span>{t('TransactionForm.excludeFromTotals')}</span>
                        </Switch.Content>
                      </Switch>
                    )}
                  />
                )}
                {watchedType !== TransactionType.TRANSFER && (
                  <>
                    <Controller
                      control={control}
                      name="account"
                      render={({ field, fieldState }) => (
                        <Select
                          isRequired
                          variant="secondary"
                          isInvalid={fieldState.invalid}
                          selectedKey={field.value?.toString()}
                          onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                          onBlur={field.onBlur}
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
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </Select>
                      )}
                    />
                    <Controller
                      control={control}
                      name="description"
                      render={({ field, fieldState }) => (
                        <TextField
                          isRequired
                          fullWidth
                          isInvalid={fieldState.invalid}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        >
                          <Label>{t('Generics.description')}</Label>
                          <InputGroup variant="secondary">
                            <InputGroup.Input type="text" />
                          </InputGroup>
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </TextField>
                      )}
                    />
                  </>
                )}
                {watchedType === TransactionType.TRANSFER && (
                  <>
                    <Controller
                      control={control}
                      name="account"
                      render={({ field, fieldState }) => (
                        <Select
                          isRequired
                          variant="secondary"
                          isInvalid={fieldState.invalid}
                          selectedKey={field.value?.toString()}
                          onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                          onBlur={field.onBlur}
                          placeholder={t('TransactionForm.selectAccount')}
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
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </Select>
                      )}
                    />
                    <Controller
                      control={control}
                      name="destinationAccount"
                      render={({ field, fieldState }) => (
                        <Select
                          isRequired
                          variant="secondary"
                          isInvalid={fieldState.invalid}
                          selectedKey={field.value?.toString()}
                          onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                          onBlur={field.onBlur}
                          placeholder={t('TransactionForm.selectAccount')}
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
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </Select>
                      )}
                    />
                  </>
                )}

                {mode === 'oneTime' && (
                  <Controller
                    control={control}
                    name="eventDate"
                    render={({ field }) => (
                      <TransactionDatePicker label={t('Generics.date')} value={field.value} onChange={field.onChange} />
                    )}
                  />
                )}

                {mode === 'recurring' && (
                  <>
                    <Controller
                      control={control}
                      name="frequency"
                      render={({ field }) => (
                        <ToggleButtonGroup
                          selectionMode="single"
                          disallowEmptySelection
                          selectedKeys={[field.value]}
                          onSelectionChange={(keys) => {
                            const next = Array.from(keys)[0] as RecurrenceFrequency | undefined;
                            if (next) field.onChange(next);
                          }}
                        >
                          <ToggleButton id={RecurrenceFrequency.INTERVAL_DAYS}>
                            {t('TransactionForm.frequency.intervalDays')}
                          </ToggleButton>
                          <ToggleButton id={RecurrenceFrequency.MONTHLY_DAYS}>
                            {t('TransactionForm.frequency.monthlyDays')}
                          </ToggleButton>
                        </ToggleButtonGroup>
                      )}
                    />

                    {watchedFrequency === RecurrenceFrequency.INTERVAL_DAYS && (
                      <Controller
                        control={control}
                        name="intervalDays"
                        render={({ field, fieldState }) => (
                          <NumberField
                            minValue={1}
                            fullWidth
                            isRequired
                            variant="secondary"
                            isInvalid={fieldState.invalid}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          >
                            <Label>{t('TransactionForm.intervalDaysLabel')}</Label>
                            <InputGroup variant="secondary" fullWidth>
                              <InputGroup.Input />
                            </InputGroup>
                            {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                          </NumberField>
                        )}
                      />
                    )}

                    {watchedFrequency === RecurrenceFrequency.MONTHLY_DAYS && (
                      <Controller
                        control={control}
                        name="daysOfMonth"
                        render={({ field, fieldState }) => (
                          <>
                            <CheckboxGroup
                              value={(watchedDaysOfMonth ?? [])
                                .slice()
                                .sort((a, b) => a - b)
                                .map(String)}
                              onChange={(keys: string[]) => field.onChange(keys.map(Number))}
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
                            {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                          </>
                        )}
                      />
                    )}

                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <TransactionDatePicker
                          label={t('TransactionForm.startDate')}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <Switch
                      size="sm"
                      isSelected={!watchedHasEndDate}
                      onChange={(selected: boolean) => setValue('hasEndDate', !selected, { shouldDirty: true })}
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <span>{t('TransactionForm.noEndDate')}</span>
                      </Switch.Content>
                    </Switch>

                    {watchedHasEndDate && (
                      <Controller
                        control={control}
                        name="endDate"
                        render={({ field, fieldState }) => (
                          <div className="flex flex-col gap-1">
                            <TransactionDatePicker
                              label={t('TransactionForm.endDate')}
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                          </div>
                        )}
                      />
                    )}
                  </>
                )}

                {watchedType !== TransactionType.TRANSFER && (
                  <>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field, fieldState }) => (
                        <Select
                          isRequired
                          variant="secondary"
                          isInvalid={fieldState.invalid}
                          selectedKey={field.value?.toString()}
                          onSelectionChange={(key) => {
                            const categoryId = key ? Number(key) : undefined;
                            field.onChange(categoryId);
                            const validSubcategories = subcategories.filter(
                              (subcategory) => subcategory.parentCategoryId === categoryId
                            );
                            setValue('subcategory', validSubcategories[0]?.id, { shouldDirty: true });
                          }}
                          onBlur={field.onBlur}
                          placeholder={t('TransactionForm.selectCategory')}
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
                                  hidden={category.type !== watchedType}
                                >
                                  {category.name}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </Select>
                      )}
                    />

                    <Controller
                      control={control}
                      name="subcategory"
                      render={({ field, fieldState }) => (
                        <Select
                          isRequired
                          isDisabled={!watchedCategory}
                          variant="secondary"
                          isInvalid={fieldState.invalid}
                          selectedKey={field.value?.toString()}
                          onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                          onBlur={field.onBlur}
                          placeholder={t('TransactionForm.selectSubcategory')}
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
                          {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                        </Select>
                      )}
                    />
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                {!isSubmitting && (
                  <Button type="submit" variant="primary" fullWidth>
                    {isEditingExisting ? t('Generics.edit') : t('Generics.save')}
                  </Button>
                )}
                {isSubmitting && (
                  <Button type="button" isDisabled fullWidth>
                    {isEditingExisting ? t('Generics.editing') : t('Generics.saving')}...
                  </Button>
                )}
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
