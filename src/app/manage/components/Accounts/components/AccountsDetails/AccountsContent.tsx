'use client';

import { Card, toast } from '@heroui/react';
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
  const { showAccountForm, overlayState } = useAccountForm();
  const isAccountFormOpen = overlayState.isOpen;

  useEffect(() => {
    if (!isAccountFormOpen) {
      setIsEditing(null);
    } else {
      toast.clear();
    }
  }, [isAccountFormOpen]);

  const editHandler = (account: AccountResponse) => {
    setIsEditing(account.id);
    showAccountForm(account);
  };

  const deleteHandler = async (account: AccountResponse) => {
    setIsDeleting(account.id);

    try {
      await deleteAccountById(account.id);

      toast.success(t('AccountForm.deletedSuccess', { id: account.id }));
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('AccountForm.unexpectedError'));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-6 sm:flex-row">
      {accounts.map((account) => (
        <Card key={account.id}>
          <Card.Header className="flex justify-between pb-0">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <div className="flex flex-row justify-evenly gap-2 sm:hidden">
                {!(isEditing === account.id) && (
                  <Button
                    variant="secondary"
                    onPress={() => editHandler(account)}
                    size="sm"
                    aria-label={t('Generics.edit')}
                  >
                    <HiPencil className="mr-1 size-5" aria-label="" />
                    <span className="hidden md:block">{t('Generics.edit')}</span>
                  </Button>
                )}
                {isEditing === account.id && (
                  <Button isDisabled variant="secondary" size="sm" aria-label={t('Generics.editing')}>
                    <span className="hidden md:block">{t('Generics.editing')}</span>
                  </Button>
                )}
                {!(isDeleting === account.id) && (
                  <Button
                    variant="danger"
                    onPress={() => deleteHandler(account)}
                    size="sm"
                    aria-label={t('Generics.delete')}
                  >
                    <HiTrash className="mr-1 size-5" aria-label="" />
                    <span className="hidden md:block">{t('Generics.delete')}</span>
                  </Button>
                )}
                {isDeleting === account.id && (
                  <Button isDisabled variant="danger" size="sm" aria-label={t('Generics.deleting')}>
                    <span className="hidden md:block">{t('Generics.deleting')}</span>
                  </Button>
                )}
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-center">
              <Money
                amount={account.accountBalance}
                currency={account.currency}
                locale={locale}
                className="overflow-hidden text-2xl font-medium"
              />
            </div>
          </Card.Content>
          <Card.Footer className="pt-0">
            <div className="hidden w-full flex-row justify-evenly gap-4 sm:flex">
              {!(isEditing === account.id) && (
                <Button
                  className="md:min-w-28"
                  variant="secondary"
                  onPress={() => editHandler(account)}
                  size="sm"
                  aria-label={t('Generics.edit')}
                >
                  <HiPencil className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.edit')}</span>
                </Button>
              )}
              {isEditing === account.id && (
                <Button isDisabled variant="secondary" size="sm" aria-label={t('Generics.editing')}>
                  <span className="hidden md:block">{t('Generics.editing')}</span>
                </Button>
              )}
              {!(isDeleting === account.id) && (
                <Button
                  className="md:min-w-28"
                  variant="danger"
                  onPress={() => deleteHandler(account)}
                  size="sm"
                  aria-label={t('Generics.delete')}
                >
                  <HiTrash className="mr-1 size-5" aria-label="" />
                  <span className="hidden md:block">{t('Generics.delete')}</span>
                </Button>
              )}
              {isDeleting === account.id && (
                <Button isDisabled variant="danger" size="sm" aria-label={t('Generics.deleting')}>
                  <span className="hidden md:block">{t('Generics.deleting')}</span>
                </Button>
              )}
            </div>
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
};
