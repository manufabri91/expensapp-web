'use client';

import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { NumberInput } from '@heroui/number-input';
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
  const { accountFormData, clearForm, isOpen, onOpenChange } = useAccountForm();
  const { addAccount } = useAccounts();
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null);
  const [editedAccount, setEditedAccount] = useState<AccountResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const currencyItems = ALLOWED_CURRENCIES.map((currency) => ({
    key: currency,
    label: `${t(`Generics.currencies.${currency}.singular`)} (${getCurrencySymbol(locale, currency)})`,
  }));

  useEffect(() => {
    console.log(createdAccount);
    if (createdAccount) {
      addToast({ title: t('AccountForm.createdSuccess', { id: createdAccount.id }), color: 'success' });
      setCreatedAccount(null);
      setProcessing(false);
      clearForm();
    } else if (editedAccount) {
      addToast({ title: t('AccountForm.editedSuccess', { id: editedAccount.id }), color: 'success' });
      setEditedAccount(null);
      setProcessing(false);
      clearForm();
    }
  }, [clearForm, createdAccount, editedAccount, addToast, t]);

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
      clearForm();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} className="overflow-y-auto">
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
                  size="lg"
                  type="text"
                  id="name"
                  name="name"
                  label={t('AccountForm.name')}
                  labelPlacement="outside-top"
                  defaultValue={accountFormData?.name}
                  isRequired
                  fullWidth
                />
                <Select
                  size="lg"
                  labelPlacement="outside"
                  label={t('AccountForm.currency')}
                  id="currency"
                  name="currency"
                  defaultSelectedKeys={[accountFormData?.currency || 'EUR']}
                  value={accountFormData?.currency || 'EUR'}
                  isRequired
                  fullWidth
                >
                  {currencyItems.map(({ key, label }) => (
                    <SelectItem key={key}>{label}</SelectItem>
                  ))}
                </Select>
                <NumberInput
                  size="lg"
                  id="initialBalance"
                  name="initialBalance"
                  label={t('AccountForm.initialBalance')}
                  labelPlacement="outside"
                  defaultValue={accountFormData?.initialBalance ?? 0}
                  min="0"
                  inputMode="decimal"
                  hideStepper
                  fullWidth
                  isRequired
                />

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
