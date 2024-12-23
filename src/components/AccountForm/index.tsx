'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { createAccount, editAccount } from '@/lib/actions/accounts';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { AccountResponse } from '@/types/dto';
import { data as currenciesList } from 'currency-codes';

import { Label, Modal, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';

export const AccountForm = () => {
  const { showToast } = useToaster();
  const { accountFormData, isOpen, closeAccountForm } = useAccountForm();
  const { addAccount } = useAccounts();
  const [createdAccount, setCreatedAccount] = useState<AccountResponse | null>(null);
  const [editedAccount, setEditedAccount] = useState<AccountResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    console.log(createdAccount);
    if (createdAccount) {
      showToast(`Created Account with ID: ${createdAccount.id}`);
      setCreatedAccount(null);
      closeAccountForm();
      setProcessing(false);
    } else if (editedAccount) {
      showToast(`Edited Account with ID: ${editedAccount.id}`);
      setEditedAccount(null);
      closeAccountForm();
      setProcessing(false);
    }
  }, [closeAccountForm, createdAccount, editedAccount, showToast]);

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    if (!accountFormData) {
      const createdAccount = await createAccount(formData);
      setCreatedAccount(createdAccount);
      addAccount(createdAccount);
    } else {
      const updatedAccocreatedAccount = await editAccount(formData);
      setEditedAccount(updatedAccocreatedAccount);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="md" onClose={closeAccountForm} popup>
      <Modal.Header as={'div'} className="m-4">
        <h3>{accountFormData ? 'Edit ' : 'Create '}Account</h3>
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
              <Label htmlFor="name" value="Account Name" />
            </div>
            <TextInput id="name" name="name" type="text" defaultValue={accountFormData?.name} required shadow />
          </div>
          {!accountFormData && (
            <div>
              <div className="mb-2 block">
                <Label htmlFor="initialBalance" value="Initial Balance" />
              </div>
              <TextInput
                id="initialBalance"
                name="initialBalance"
                type="number"
                defaultValue={0}
                min="0"
                step=".01"
                required
                shadow
              />
            </div>
          )}

          <div className="max-w-md">
            <div className="mb-2 block">
              <Label htmlFor="currency" value="Currency" />
            </div>
            <Select id="currency" name="currency" defaultValue={accountFormData?.currency} required>
              <option value={undefined}>Select Currency</option>
              {currenciesList.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.currency}
                </option>
              ))}
            </Select>
          </div>

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {accountFormData ? 'Edit' : 'Create'}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
