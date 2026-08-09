'use client';

import { FieldError, InputGroup, Label, ListBox, Modal, NumberField, Select, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { Button } from '@/components/Button';
import { ALLOWED_CURRENCIES } from '@/constants';
import { createAccount, editAccount } from '@/lib/actions/accounts';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { accountFormSchema, AccountFormValues } from '@/schemas/account';

import { getCurrencySymbol } from '@/utils/currency';

const defaultValues: AccountFormValues = { name: '', currency: 'EUR', initialBalance: 0 };

export const AccountForm = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { accountFormData, clearForm, overlayState } = useAccountForm();
  const { addAccount } = useAccounts();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const currencyItems = ALLOWED_CURRENCIES.map((currency) => ({
    key: currency,
    label: `${t(`Generics.currencies.${currency}.singular`)} (${getCurrencySymbol(locale, currency)})`,
  }));

  useEffect(() => {
    if (!overlayState.isOpen) return;
    reset(
      accountFormData
        ? {
            id: accountFormData.id,
            name: accountFormData.name,
            currency: accountFormData.currency,
            initialBalance: accountFormData.initialBalance,
          }
        : defaultValues
    );
  }, [overlayState.isOpen, accountFormData, reset]);

  const onValid = async (data: AccountFormValues) => {
    try {
      if (!accountFormData) {
        const created = await createAccount(data);
        addAccount(created);
        toast.success(t('AccountForm.createdSuccess', { id: created.id }));
      } else {
        const edited = await editAccount(data);
        toast.success(t('AccountForm.editedSuccess', { id: edited.id }));
      }
      clearForm();
      overlayState.close();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('AccountForm.unexpectedError'));
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal>
      <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {accountFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.account')}
              </Modal.Heading>
            </Modal.Header>
            <form onSubmit={handleSubmit(onValid)}>
              <Modal.Body className="flex flex-col gap-4">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <TextField
                      isRequired
                      fullWidth
                      isInvalid={fieldState.invalid}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <Label>{t('AccountForm.name')}</Label>
                      <InputGroup variant="secondary">
                        <InputGroup.Input type="text" />
                      </InputGroup>
                      {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                    </TextField>
                  )}
                />
                <Controller
                  control={control}
                  name="currency"
                  render={({ field, fieldState }) => (
                    <Select
                      isRequired
                      fullWidth
                      variant="secondary"
                      isInvalid={fieldState.invalid}
                      selectedKey={field.value}
                      onSelectionChange={(key) => field.onChange(key ? String(key) : '')}
                      onBlur={field.onBlur}
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
                      {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name="initialBalance"
                  render={({ field, fieldState }) => (
                    <NumberField
                      fullWidth
                      isRequired
                      variant="secondary"
                      isInvalid={fieldState.invalid}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <Label>{t('AccountForm.initialBalance')}</Label>
                      <InputGroup variant="secondary" fullWidth>
                        <InputGroup.Input />
                      </InputGroup>
                      {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                    </NumberField>
                  )}
                />
              </Modal.Body>
              <Modal.Footer>
                {!isSubmitting && (
                  <Button type="submit" variant="primary" fullWidth>
                    {accountFormData ? t('Generics.edit') : t('Generics.save')}
                  </Button>
                )}
                {isSubmitting && (
                  <Button type="button" isDisabled fullWidth>
                    {accountFormData ? t('Generics.editing') : t('Generics.saving')}...
                  </Button>
                )}
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
