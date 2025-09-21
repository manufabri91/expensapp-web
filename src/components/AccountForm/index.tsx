'use client';

import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { addToast } from '@heroui/toast';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { Button } from '@/components/Button';
import { ALLOWED_CURRENCIES } from '@/constants';
import { createAccount, editAccount } from '@/lib/actions/accounts';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { AccountResponse } from '@/types/dto';

import { getCurrencySymbol } from '@/utils/currency';

export const AccountForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { onOpenChange, isOpen } = useDisclosure();
  const { accountFormData, onFormClose } = useAccountForm();
  const { addAccount } = useAccounts();
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null);
  const [editedAccount, setEditedAccount] = useState<AccountResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    console.log(createdAccount);
    if (createdAccount) {
      addToast({ title: t('AccountForm.createdSuccess', { id: createdAccount.id }), color: 'success' });
      setCreatedAccount(null);
      setProcessing(false);
      onFormClose();
    } else if (editedAccount) {
      addToast({ title: t('AccountForm.editedSuccess', { id: editedAccount.id }), color: 'success' });
      setEditedAccount(null);
      setProcessing(false);
      onFormClose();
    }
  }, [onFormClose, createdAccount, editedAccount, addToast, t]);

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    try {
      if (!accountFormData) {
        const createdAccount = await createAccount(formData);
        setCreatedAccount(createdAccount);
        addAccount(createdAccount);
      } else {
        const updatedAccount = await editAccount(formData);
        setEditedAccount(updatedAccount);
      }
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('AccountForm.unexpectedError'), color: 'danger' });
      }
      setCreatedAccount(null);
      setEditedAccount(null);
      setProcessing(false);
      onFormClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {accountFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.account')}
            </ModalHeader>
            <ModalBody>
              <form className="flex max-w-md flex-col gap-4" action={submitHandler}>
                {!!accountFormData && (
                  <div className="hidden">
                    <Input id="id" name="id" type="text" value={`${accountFormData?.id}`} readOnly />
                  </div>
                )}
                <Input
                  id="name"
                  fullWidth
                  isRequired
                  label={t('AccountForm.name')}
                  name="name"
                  defaultValue={accountFormData?.name}
                  type="text"
                />
                <Input
                  id="initialBalance"
                  fullWidth
                  isRequired
                  label={t('AccountForm.initialBalance')}
                  name="initialBalance"
                  type="number"
                  min="0"
                  step=".01"
                />
                <Select label="Currency">
                  {ALLOWED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency}>
                      {t(`Generics.currencies.${currency}.singular`)} ({getCurrencySymbol(locale, currency ?? '')})
                    </SelectItem>
                  ))}
                </Select>

                <Button onPress={onClose} type="submit" color="primary" isLoading={processing}>
                  {accountFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
