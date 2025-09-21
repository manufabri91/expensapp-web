import React from 'react';
import { getAccounts } from '@/lib/actions/accounts';
import { AccountsDetailsContent } from './AccountsContent';

export const AccountsDetails = async () => {
  const accounts = await getAccounts();

  return <AccountsDetailsContent accounts={accounts} />;
};
