'use client';

import { AccountForm } from '@/components/AccountForm';
import { AccountResponse } from '@/types/dto';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface AccountFormContextProps {
  isOpen: boolean;
  showAccountForm: (Account?: AccountResponse) => void;
  closeAccountForm: () => void;
  accountFormData: AccountResponse | undefined;
}

const AccountFormContext = createContext<AccountFormContextProps | undefined>(undefined);

export const AccountFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accountFormData, setaccountFormData] = useState<AccountResponse | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showAccountForm = useMemo(
    () => (account?: AccountResponse) => {
      setaccountFormData(account);
      setIsOpen(true);
    },
    [setaccountFormData]
  );

  const closeAccountForm = useMemo(
    () => () => {
      setaccountFormData(undefined);
      setIsOpen(false);
    },
    [setaccountFormData]
  );

  return (
    <AccountFormContext.Provider value={{ showAccountForm, closeAccountForm, accountFormData, isOpen }}>
      {children}
      <AccountForm />
    </AccountFormContext.Provider>
  );
};

export const useAccountForm = (): AccountFormContextProps => {
  const context = useContext(AccountFormContext);
  if (!context) {
    throw new Error('useAccountForm must be used within a AccountFormProvider');
  }
  return context;
};
