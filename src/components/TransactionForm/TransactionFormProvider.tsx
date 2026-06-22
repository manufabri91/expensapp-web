'use client';

import { useOverlayState, type UseOverlayStateReturn } from '@heroui/react';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionResponse } from '@/types/dto';

interface TransactionFormContextProps {
  overlayState: UseOverlayStateReturn;
  showTransactionForm: (transaction?: TransactionResponse) => void;
  clearForm: () => void;
  transactionFormData: TransactionResponse | undefined;
}

const TransactionFormContext = createContext<TransactionFormContextProps | undefined>(undefined);

export const TransactionFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactionFormData, setTransactionFormData] = useState<TransactionResponse | undefined>();
  const overlayState = useOverlayState();

  const showTransactionForm = useMemo(
    () => (transaction?: TransactionResponse) => {
      setTransactionFormData(transaction);
      overlayState.open();
    },
    [setTransactionFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setTransactionFormData(undefined);
    },
    [setTransactionFormData]
  );

  return (
    <TransactionFormContext.Provider value={{ showTransactionForm, clearForm, transactionFormData, overlayState }}>
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
