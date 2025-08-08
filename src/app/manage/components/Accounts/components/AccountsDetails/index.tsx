import { getAccounts } from '@/lib/actions/accounts';
import { AccountsDetailsContent } from './AccountsContent';
import React from 'react';

export const AccountsDetails = async () => {
  const accounts = await getAccounts();

  return <AccountsDetailsContent accounts={accounts} />;
};
