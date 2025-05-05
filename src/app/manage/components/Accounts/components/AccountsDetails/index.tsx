'use client';

import { Card } from 'flowbite-react';
import { HiTrash, HiPencil } from 'react-icons/hi2';
import { Button, ButtonVariant, Money, ToastType } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { AccountResponse } from '@/types/dto';
import { useEffect, useState } from 'react';
import { ActionResult } from '@/types/viewModel/actionResult';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { useToaster } from '@/components/Toast/ToastProvider';

export const AccountsDetails = () => {
  const [changedTransaction, setChangedTransaction] = useState<ActionResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const { showToast, clearToast } = useToaster();
  const { accounts } = useAccounts();
  const { showAccountForm, isOpen: isAccountFormOpen } = useAccountForm();

  useEffect(() => {
    if (changedTransaction) {
      showToast(changedTransaction.message, changedTransaction.success ? ToastType.Success : ToastType.Error);
    }
  }, [changedTransaction, showToast, clearToast]);

  useEffect(() => {
    if (!isAccountFormOpen) {
      setIsEditing(null);
    }
  }, [isAccountFormOpen]);

  const editHandler = (account: AccountResponse) => {
    setIsEditing(account.id);
    showAccountForm(account);
  };

  const deleteHandler = async (account: AccountResponse) => {
    setIsDeleting(account.id);
    const result = await deleteTransactionById(account.id);
    setChangedTransaction(result);
    setIsDeleting(null);
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {accounts.map((account) => (
        <Card key={account.id}>
          <div className="flex justify-between">
            <div className="flex flex-col justify-between pr-4">
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <Money amount={account.accountBalance} currency={account.currency} className="text-2xl" />
            </div>
            <div className="flex h-full flex-col justify-evenly gap-4">
              {!isEditing && (
                <Button
                  className="min-w-28"
                  variant={ButtonVariant.Secondary}
                  onClick={() => editHandler(account)}
                  size="sm"
                  title="Edit"
                >
                  <HiPencil className="mr-1 size-5" aria-label="edit" />
                  <span>Edit</span>
                </Button>
              )}
              {isEditing && (
                <Button isProcessing variant={ButtonVariant.Secondary} size="sm" title="Editing">
                  <span>Editing</span>
                </Button>
              )}
              {!isDeleting && (
                <Button
                  className="min-w-28"
                  variant={ButtonVariant.Critical}
                  onClick={() => deleteHandler(account)}
                  size="sm"
                  title="Delete"
                >
                  <HiTrash className="mr-1 size-5" aria-label="delete" />
                  <span>Delete</span>
                </Button>
              )}
              {isDeleting && (
                <Button isProcessing variant={ButtonVariant.Critical} size="sm" title="Deleting">
                  <span>Deleting</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
