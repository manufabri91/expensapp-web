'use client';

import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { addToast, closeAll } from '@heroui/toast';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { HiPencil, HiTrash } from 'react-icons/hi2';
import { Button, Money } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { deleteAccountById } from '@/lib/actions/accounts';
import { AccountResponse } from '@/types/dto';

interface Props {
  accounts: AccountResponse[];
}
export const AccountsDetailsContent = ({ accounts }: Props) => {
  const t = useTranslations();
  const locale = useLocale();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const { showAccountForm, isOpen: isAccountFormOpen } = useAccountForm();

  useEffect(() => {
    if (!isAccountFormOpen) {
      setIsEditing(null);
    } else {
      closeAll();
    }
  }, [isAccountFormOpen, closeAll]);

  const editHandler = (account: AccountResponse) => {
    setIsEditing(account.id);
    showAccountForm(account);
  };

  const deleteHandler = async (account: AccountResponse) => {
    setIsDeleting(account.id);

    try {
      await deleteAccountById(account.id);

      addToast({ title: t('AccountForm.deletedSuccess', { id: account.id }), color: 'success' });
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('AccountForm.unexpectedError'), color: 'danger' });
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-6 sm:flex-row">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex justify-between pb-0">
            <h3 className="text-lg font-semibold">{account.name}</h3>
            <div className="flex flex-row justify-evenly gap-4 sm:hidden">
              {!(isEditing === account.id) && (
                <Button color="secondary" onPress={() => editHandler(account)} size="sm" title={t('Generics.edit')}>
                  <HiPencil className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.edit')}</span>
                </Button>
              )}
              {isEditing === account.id && (
                <Button isLoading color="secondary" size="sm" title={t('Generics.editing')}>
                  <span className="hidden md:block">{t('Generics.editing')}</span>
                </Button>
              )}
              {!(isDeleting === account.id) && (
                <Button color="danger" onPress={() => deleteHandler(account)} size="sm" title={t('Generics.delete')}>
                  <HiTrash className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.delete')}</span>
                </Button>
              )}
              {isDeleting === account.id && (
                <Button isLoading color="danger" size="sm" title={t('Generics.deleting')}>
                  <span className="hidden md:block">{t('Generics.deleting')}</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center">
              <Money
                amount={account.accountBalance}
                currency={account.currency}
                locale={locale}
                className="overflow-hidden text-2xl font-medium"
              />
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <div className="hidden w-full flex-row justify-evenly gap-4 sm:flex">
              {!(isEditing === account.id) && (
                <Button
                  className="md:min-w-28"
                  color="secondary"
                  onPress={() => editHandler(account)}
                  size="sm"
                  title={t('Generics.edit')}
                >
                  <HiPencil className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.edit')}</span>
                </Button>
              )}
              {isEditing === account.id && (
                <Button isLoading color="secondary" size="sm" title={t('Generics.editing')}>
                  <span className="hidden md:block">{t('Generics.editing')}</span>
                </Button>
              )}
              {!(isDeleting === account.id) && (
                <Button
                  className="md:min-w-28"
                  color="danger"
                  onPress={() => deleteHandler(account)}
                  size="sm"
                  title={t('Generics.delete')}
                >
                  <HiTrash className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.delete')}</span>
                </Button>
              )}
              {isDeleting === account.id && (
                <Button isLoading color="danger" size="sm" title={t('Generics.deleting')}>
                  <span className="hidden md:block">{t('Generics.deleting')}</span>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
