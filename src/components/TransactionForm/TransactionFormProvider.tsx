'use client';

import { useOverlayState, type UseOverlayStateReturn } from '@heroui/react';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionMode } from '@/components/TransactionModeSelector';
import { RecurringTransactionResponse, TransactionResponse } from '@/types/dto';

interface TransactionFormContextProps {
  overlayState: UseOverlayStateReturn;
  showTransactionForm: (transaction?: TransactionResponse, context?: { accountId?: number }) => void;
  showRecurringTransactionForm: (recurrence?: RecurringTransactionResponse, context?: { accountId?: number }) => void;
  openingAccountId?: number;
  clearForm: () => void;
  formMode: TransactionMode;
  transactionFormData: TransactionResponse | undefined;
  recurringFormData: RecurringTransactionResponse | undefined;
}

const TransactionFormContext = createContext<TransactionFormContextProps | undefined>(undefined);

export const TransactionFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactionFormData, setTransactionFormData] = useState<TransactionResponse | undefined>();
  const [recurringFormData, setRecurringFormData] = useState<RecurringTransactionResponse | undefined>();
  const [openingAccountId, setOpeningAccountId] = useState<number>();
  const [formMode, setFormMode] = useState<TransactionMode>('oneTime');
  const overlayState = useOverlayState();

  const showTransactionForm = useMemo(
    () => (transaction?: TransactionResponse, context?: { accountId?: number }) => {
      setOpeningAccountId(context?.accountId);
      setFormMode('oneTime');
      setRecurringFormData(undefined);
      setTransactionFormData(transaction);
      overlayState.open();
    },
    [setTransactionFormData]
  );

  const showRecurringTransactionForm = useMemo(
    () => (recurrence?: RecurringTransactionResponse, context?: { accountId?: number }) => {
      setOpeningAccountId(context?.accountId);
      setFormMode('recurring');
      setTransactionFormData(undefined);
      setRecurringFormData(recurrence);
      overlayState.open();
    },
    [setRecurringFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setOpeningAccountId(undefined);
      setTransactionFormData(undefined);
      setRecurringFormData(undefined);
      setFormMode('oneTime');
    },
    [setTransactionFormData, setRecurringFormData]
  );

  return (
    <TransactionFormContext.Provider
      value={{
        openingAccountId,
        showTransactionForm,
        showRecurringTransactionForm,
        clearForm,
        formMode,
        transactionFormData,
        recurringFormData,
        overlayState,
      }}
    >
      {children}
      <TransactionForm />
    </TransactionFormContext.Provider>
  );
};

export const useTransactionForm = (): TransactionFormContextProps => {
  const context = useContext(TransactionFormContext);
  if (!context) {
    throw new Error('useTransactionForm must be used within a TransactionFormProvider');
  }
  return context;
};
