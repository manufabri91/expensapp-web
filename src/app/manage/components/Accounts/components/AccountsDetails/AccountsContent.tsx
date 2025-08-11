'use client';

import { Card } from 'flowbite-react';
import { HiTrash, HiPencil } from 'react-icons/hi2';
import { Button, ButtonVariant, Money, ToastType } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { AccountResponse } from '@/types/dto';
import { useEffect, useState } from 'react';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useLocale, useTranslations } from 'next-intl';
import { deleteAccountById } from '@/lib/actions/accounts';

interface Props {
  accounts: AccountResponse[];
}
export const AccountsDetailsContent = ({ accounts }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const { showToast, clearToast } = useToaster();
  const { showAccountForm, isOpen: isAccountFormOpen } = useAccountForm();

  useEffect(() => {
    if (!isAccountFormOpen) {
      setIsEditing(null);
    } else {
      clearToast();
    }
  }, [isAccountFormOpen, clearToast]);

  const editHandler = (account: AccountResponse) => {
    setIsEditing(account.id);
    showAccountForm(account);
  };

  const deleteHandler = async (account: AccountResponse) => {
    setIsDeleting(account.id);

    try {
      await deleteAccountById(account.id);

      showToast(t('AccountForm.deletedSuccess', { id: account.id }), ToastType.Success);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, ToastType.Error);
      } else {
        showToast(t('AccountForm.unexpectedError'), ToastType.Error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {accounts.map((account) => (
        <Card key={account.id}>
          <div className="flex justify-between">
            <div className="flex flex-col justify-between pr-4">
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <Money amount={account.accountBalance} currency={account.currency} locale={locale} className="text-2xl" />
            </div>
            <div className="flex h-full flex-col justify-evenly gap-4">
              {!(isEditing === account.id) && (
                <Button
                  className="min-w-28"
                  variant={ButtonVariant.Secondary}
                  onClick={() => editHandler(account)}
                  size="sm"
                  title={t('Generics.edit')}
                >
                  <HiPencil className="mr-1 size-5" aria-label="" />
                  <span>{t('Generics.edit')}</span>
                </Button>
              )}
              {isEditing === account.id && (
                <Button isProcessing variant={ButtonVariant.Secondary} size="sm" title={t('Generics.editing')}>
                  <span>{t('Generics.editing')}</span>
                </Button>
              )}
              {!(isDeleting === account.id) && (
                <Button
                  className="min-w-28"
                  variant={ButtonVariant.Critical}
                  onClick={() => deleteHandler(account)}
                  size="sm"
                  title={t('Generics.delete')}
                >
                  <HiTrash className="mr-1 size-5" aria-label="" />
                  <span>{t('Generics.delete')}</span>
                </Button>
              )}
              {isDeleting === account.id && (
                <Button isProcessing variant={ButtonVariant.Critical} size="sm" title={t('Generics.deleting')}>
                  <span>{t('Generics.deleting')}</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
