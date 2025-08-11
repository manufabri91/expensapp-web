'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { createAccount, editAccount } from '@/lib/actions/accounts';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { AccountResponse } from '@/types/dto';

import { Label, Modal, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ToastType } from '@/components/Toast';
import { ALLOWED_CURRENCIES } from '@/constants';
import { getCurrencySymbol } from '@/utils/currency';

export const AccountForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { showToast } = useToaster();
  const { accountFormData, isOpen, closeAccountForm } = useAccountForm();
  const { addAccount } = useAccounts();
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null);
  const [editedAccount, setEditedAccount] = useState<AccountResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    console.log(createdAccount);
    if (createdAccount) {
      showToast(t('AccountForm.createdSuccess', { id: createdAccount.id }), ToastType.Success);
      setCreatedAccount(null);
      closeAccountForm();
      setProcessing(false);
    } else if (editedAccount) {
      showToast(t('AccountForm.editedSuccess', { id: editedAccount.id }), ToastType.Success);
      setEditedAccount(null);
      closeAccountForm();
      setProcessing(false);
    }
  }, [closeAccountForm, createdAccount, editedAccount, showToast, t]);

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
        showToast(error.message, ToastType.Error);
      } else {
        showToast(t('AccountForm.unexpectedError'), ToastType.Error);
      }
      setCreatedAccount(null);
      setEditedAccount(null);
      setProcessing(false);
      closeAccountForm();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="md" onClose={closeAccountForm} popup>
      <Modal.Header as={'div'} className="m-4">
        {accountFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.account')}
      </Modal.Header>
      <Modal.Body>
        <form className="flex max-w-md flex-col gap-4" action={submitHandler}>
          {!!accountFormData && (
            <div className="hidden">
              <div className="mb-2 block">
                <Label htmlFor="id" value="ID" />
              </div>
              <TextInput id="id" name="id" type="text" value={accountFormData?.id} readOnly shadow />
            </div>
          )}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value={t('AccountForm.name')} />
            </div>
            <TextInput id="name" name="name" type="text" defaultValue={accountFormData?.name} required shadow />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="initialBalance" value={t('AccountForm.initialBalance')} />
            </div>
            <TextInput
              id="initialBalance"
              name="initialBalance"
              type="number"
              defaultValue={accountFormData?.initialBalance ?? 0}
              min="0"
              step=".01"
              required
              shadow
            />
          </div>
          <div className="max-w-md">
            <div className="mb-2 block">
              <Label htmlFor="currency" value="Currency" />
            </div>
            <Select id="currency" name="currency" defaultValue={accountFormData?.currency} required>
              <option value={undefined}>{t('AccountForm.selectCurrency')}</option>
              {ALLOWED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {t(`Generics.currencies.${currency}.singular`)} ({getCurrencySymbol(locale, currency ?? '')})
                </option>
              ))}
            </Select>
          </div>

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {accountFormData ? t('Generics.edit') : t('Generics.save')}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
