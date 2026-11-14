import { zodResolver } from '@hookform/resolvers/zod';
import { isFuture } from 'date-fns';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { TransactionMode } from '@/components/TransactionModeSelector';
import { useAccountPreferences } from '@/lib/providers/AccountPreferencesProvider';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { oneTimeTransactionSchema, recurringTransactionSchema } from '@/schemas/transaction';
import { TransactionType } from '@/types/enums/transactionType';
import { resolveOpeningAccount } from '@/utils/accountPreferences';
import { useTransactionForm } from './TransactionFormProvider';
import { TransactionFormValues } from './types';
import { useAmountCalculator } from './useAmountCalculator';
import { useTransactionDefaults } from './useTransactionDefaults';

export const useTransactionDraft = () => {
  const locale = useLocale();
  const { overlayState, transactionFormData, recurringFormData, formMode, openingAccountId } = useTransactionForm();
  const { accounts } = useAccounts();
  const preferences = useAccountPreferences();
  const { filters } = useTransactionsFilters();
  const contextualAccount = filters.accountIds?.length === 1 ? filters.accountIds[0] : undefined;
  const openingAccount = resolveOpeningAccount(accounts, [
    openingAccountId,
    contextualAccount,
    preferences.defaultAccountId,
    preferences.recentAccountId,
  ]);
  const defaults = useTransactionDefaults(openingAccount);
  const [mode, setMode] = useState<TransactionMode>(formMode);
  const [step, setStep] = useState<'amount' | 'details'>('amount');
  const [modeChanged, setModeChanged] = useState(false);
  const [currencyNotice, setCurrencyNotice] = useState('');
  const initialized = useRef(false);
  const touchedTotals = useRef(false);
  const calculator = useAmountCalculator(locale);
  const form = useForm<TransactionFormValues>({
    resolver: ((values, context, options) =>
      zodResolver(mode === 'recurring' ? recurringTransactionSchema : oneTimeTransactionSchema)(
        values as never,
        context,
        options as never
      )) as Resolver<TransactionFormValues>,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: defaults.buildOneTimeDefaults(),
  });
  const [type, accountId, destinationId, eventDate] = useWatch({
    control: form.control,
    name: ['type', 'account', 'destinationAccount', 'eventDate'],
  });
  const selectedAccount = accounts.find((account) => account.id === accountId);
  const destination = accounts.find((account) => account.id === destinationId);
  const isEditing = !!transactionFormData || !!recurringFormData;

  // Initialize once per opening, after preferences load. Never reseed a draft from refreshed lists.
  useEffect(() => {
    if (!overlayState.isOpen) {
      initialized.current = false;
      return;
    }
    if (initialized.current || !preferences.ready) return;
    initialized.current = true;
    const values = transactionFormData
      ? defaults.buildOneTimeDefaultsFromTransaction(transactionFormData)
      : recurringFormData
        ? defaults.buildRecurringDefaultsFromRecurrence(recurringFormData)
        : formMode === 'recurring'
          ? defaults.buildRecurringDefaults()
          : defaults.buildOneTimeDefaults();
    form.reset(values);
    calculator.reset(values.amount);
    setMode(formMode);
    setStep(isEditing ? 'details' : 'amount');
    setModeChanged(false);
    setCurrencyNotice('');
    touchedTotals.current = isEditing;
  });
  useEffect(() => {
    if (mode === 'oneTime' && !isEditing && !touchedTotals.current && eventDate) {
      form.setValue('excludeFromTotals', isFuture(eventDate));
    }
  }, [eventDate, mode, isEditing, form]);

  const changeMode = (next: TransactionMode) => {
    if (next === mode) return;
    setMode(next);
    setModeChanged(true);
    if (next === 'recurring' && type === TransactionType.TRANSFER) changeType(TransactionType.EXPENSE);
  };
  const changeType = (next: TransactionType) => {
    if (type === next) return;
    form.setValue('type', next, { shouldDirty: true });
    form.setValue('category', undefined, { shouldDirty: true });
    form.setValue('subcategory', undefined, { shouldDirty: true });
    form.setValue('destinationAccount', undefined, { shouldDirty: true });
  };
  const changeAccount = (next?: number) => {
    const currency = accounts.find((account) => account.id === next)?.currency;
    if (selectedAccount && currency && currency !== selectedAccount.currency) {
      calculator.reset(Number(calculator.state.entry));
      setCurrencyNotice(currency);
    }
    form.setValue('account', next, { shouldDirty: true });
    if (destinationId === next || (destination && destination.currency !== currency)) {
      form.setValue('destinationAccount', undefined, { shouldDirty: true });
    }
  };
  const accountsValid =
    !!selectedAccount &&
    (type !== TransactionType.TRANSFER ||
      (!!destination && destination.id !== selectedAccount.id && destination.currency === selectedAccount.currency));
  const continueToDetails = () => {
    if (!accountsValid || calculator.result.value === undefined) return;
    const amount = calculator.result.value;
    form.setValue('amount', amount, { shouldDirty: true });
    calculator.reset(amount);
    setStep('details');
  };
  const dirty =
    form.formState.isDirty ||
    modeChanged ||
    !calculator.state.replace ||
    !!calculator.state.operator ||
    Number(calculator.state.entry) !== form.getValues('amount');
  return {
    form,
    mode,
    setMode,
    step,
    setStep,
    isEditing,
    defaults,
    calculator,
    accounts,
    selectedAccount,
    destination,
    type,
    accountsValid,
    preferences,
    changeMode,
    changeType,
    changeAccount,
    continueToDetails,
    dirty,
    currencyNotice,
    touchedTotals,
  };
};
export type TransactionDraft = ReturnType<typeof useTransactionDraft>;
