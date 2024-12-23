'use client';

import { Card } from 'flowbite-react';
import { HiTrash, HiPencil } from 'react-icons/hi2';
import { Button, ButtonVariant, Money } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { AccountResponse } from '@/types/dto';

export const AccountsDetails = () => {
  const { accounts } = useAccounts();
  const { showAccountForm } = useAccountForm();

  const editHandler = (account: AccountResponse) => {
    showAccountForm(account);
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id}>
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">{account.name}</h3>
            <div className="flex gap-2">
              <Button variant={ButtonVariant.Secondary} onClick={() => editHandler(account)} size="sm" title="Edit">
                <HiPencil className="mr-1 size-5" aria-label="edit" />
              </Button>
              <Button variant={ButtonVariant.Critical} onClick={() => editHandler(account)} size="sm" title="Delete">
                <HiTrash className="mr-1 size-5" aria-label="edit" />
              </Button>
            </div>
          </div>
          <Money amount={account.accountBalance} currency={account.currency} className="text-2xl" />
        </Card>
      ))}
    </div>
  );
};
