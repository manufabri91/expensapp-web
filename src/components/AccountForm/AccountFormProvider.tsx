'use client';

import { useDisclosure } from '@heroui/modal';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { AccountForm } from '@/components/AccountForm';
import { AccountResponse } from '@/types/dto';

interface AccountFormContextProps {
  isOpen: boolean;
  showAccountForm: (Account?: AccountResponse) => void;
  clearForm: () => void;
  onOpenChange: () => void;
  accountFormData: AccountResponse | undefined;
}

const AccountFormContext = createContext<AccountFormContextProps | undefined>(undefined);

export const AccountFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accountFormData, setaccountFormData] = useState<AccountResponse | undefined>();
  const { onOpen, isOpen, onOpenChange } = useDisclosure();

  const showAccountForm = useMemo(
    () => (account?: AccountResponse) => {
      setaccountFormData(account);
      onOpen();
    },
    [setaccountFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setaccountFormData(undefined);
    },
    [setaccountFormData]
  );

  return (
    <AccountFormContext.Provider value={{ showAccountForm, clearForm, accountFormData, isOpen, onOpenChange }}>
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
