import { AccountActions } from '@/app/manage/components/Accounts/components/AccountActions';
import { AccountsDetails } from '@/app/manage/components/Accounts/components/AccountsDetails';
import React from 'react';

export const Accounts = () => {
  return (
    <>
      <h3 className="my-4 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">Accounts</h3>

      <AccountActions />

      <AccountsDetails />
      <div />
    </>
  );
};
