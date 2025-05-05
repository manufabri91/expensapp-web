import { AccountActions } from '@/app/manage/components/Accounts/components/AccountActions';
import { AccountsDetails } from '@/app/manage/components/Accounts/components/AccountsDetails';
import React from 'react';

export const Accounts = () => {
  return (
    <>
      <div className="my-8 flex justify-end gap-4 md:my-16">
        <AccountActions />
      </div>
      <AccountsDetails />
      <div />
    </>
  );
};
