'use client';

import { InputGroup, Label, ListBox, Modal, NumberField, Select, TextField, toast } from '@heroui/react';
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
  const { accountFormData, clearForm, overlayState } = useAccountForm();
  const { addAccount } = useAccounts();
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null);
  const [editedAccount, setEditedAccount] = useState<AccountResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const currencyItems = ALLOWED_CURRENCIES.map((currency) => ({
    key: currency,
    label: `${t(`Generics.currencies.${currency}.singular`)} (${getCurrencySymbol(locale, currency)})`,
  }));

  useEffect(() => {
    if (createdAccount) {
      toast.success(t('AccountForm.createdSuccess', { id: createdAccount.id }));
      setCreatedAccount(null);
      setProcessing(false);
      clearForm();
    } else if (editedAccount) {
      toast.success(t('AccountForm.editedSuccess', { id: editedAccount.id }));
      setEditedAccount(null);
      setProcessing(false);
      clearForm();
    }
  }, [clearForm, createdAccount, editedAccount, t]);

  const submitHandler = async (formData: FormData, onSuccessSubmit?: () => void) => {
    setProcessing(true);
    try {
      if (!accountFormData) {
        const createdAccount = await createAccount(formData);
        setCreatedAccount(createdAccount);
        addAccount(createdAccount);
        if (onSuccessSubmit) onSuccessSubmit();
      } else {
        const updatedAccount = await editAccount(formData);
        setEditedAccount(updatedAccount);
        if (onSuccessSubmit) onSuccessSubmit();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('AccountForm.unexpectedError'));
      }
      setCreatedAccount(null);
      setEditedAccount(null);
      setProcessing(false);
      clearForm();
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {accountFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.account')}
            </Modal.Heading>
          </Modal.Header>
          <form action={(data) => submitHandler(data, () => overlayState.close())}>
            <Modal.Body className="flex flex-col gap-4">
              {!!accountFormData && (
                <div className="hidden">
                  <input id="id" name="id" type="hidden" value={`${accountFormData?.id}`} readOnly />
                </div>
              )}
              <TextField name="name" isRequired defaultValue={accountFormData?.name} fullWidth>
                <Label>{t('AccountForm.name')}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input id="name" type="text" />
                </InputGroup>
              </TextField>
              <Select
                id="currency"
                name="currency"
                defaultSelectedKey={accountFormData?.currency || 'EUR'}
                isRequired
                fullWidth
                variant="secondary"
              >
                <Label>{t('AccountForm.currency')}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {currencyItems.map(({ key, label }) => (
                      <ListBox.Item key={key} id={key} textValue={label}>
                        {label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <NumberField
                id="initialBalance"
                name="initialBalance"
                defaultValue={accountFormData?.initialBalance ?? 0}
                fullWidth
                isRequired
                variant="secondary"
              >
                <Label>{t('AccountForm.initialBalance')}</Label>
                <InputGroup variant="secondary" fullWidth>
                  <InputGroup.Input />
                </InputGroup>
              </NumberField>
            </Modal.Body>
            <Modal.Footer>
              {!processing && (
                <Button type="submit" variant="primary" fullWidth>
                  {accountFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isDisabled fullWidth>
                  {accountFormData ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
