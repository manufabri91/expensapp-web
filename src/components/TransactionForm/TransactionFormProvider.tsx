'use client';

import { TransactionResponse } from '@/types/dto';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface TransactionFormContextProps {
  isOpen: boolean;
  showTransactionForm: (transaction?: TransactionResponse) => void;
  closeTransactionForm: () => void;
  transactionFormData: TransactionResponse | undefined;
}

const TransactionFormContext = createContext<TransactionFormContextProps | undefined>(undefined);

export const TransactionFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactionFormData, setTransactionFormData] = useState<TransactionResponse | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showTransactionForm = useMemo(
    () => (transaction?: TransactionResponse) => {
      setTransactionFormData(transaction);
      setIsOpen(true);
    },
    [setTransactionFormData]
  );

  const closeTransactionForm = useMemo(
    () => () => {
      setTransactionFormData(undefined);
      setIsOpen(false);
    },
    [setTransactionFormData]
  );

  return (
    <TransactionFormContext.Provider value={{ showTransactionForm, closeTransactionForm, transactionFormData, isOpen }}>
      {children}
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
