'use client';

import { AccountResponse } from '@/types/dto';
import React, { createContext, useState, ReactNode, useContext } from 'react';

interface AccountsContextProps {
  accounts: AccountResponse[];
  addAccount: (category: AccountResponse) => void;
  deleteAccount: (id: number) => void;
}

const AccountsContext = createContext<AccountsContextProps>({
  accounts: [],
  addAccount: () => {},
  deleteAccount: () => {},
});

const useAccounts = (): AccountsContextProps => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within a AccountsProvider');
  }
  return context;
};

const AccountsProvider: React.FC<{
  children: ReactNode;
  initialAccounts: AccountResponse[];
}> = ({ children, initialAccounts }) => {
  const [accounts, setAccounts] = useState<AccountResponse[]>(initialAccounts);

  const addAccount = (account: AccountResponse) => {
    setAccounts((prev) => [...prev, account]);
  };

  const deleteAccount = (id: number) => {
    const newAccounts = accounts.filter((account) => account.id !== id);
    setAccounts(newAccounts);
  };

  return (
    <AccountsContext.Provider value={{ accounts, addAccount, deleteAccount }}>{children}</AccountsContext.Provider>
  );
};

export { AccountsProvider, useAccounts };
