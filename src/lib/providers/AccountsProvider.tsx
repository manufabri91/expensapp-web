'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccountResponse } from '@/types/dto';

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

  useEffect(() => {
    setAccounts(initialAccounts);
    // initialAccounts is re-fetched per request in AppProviders (e.g. on login/logout) - resync
    // whenever it changes instead of only using it on first mount.
  }, [initialAccounts]);

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
