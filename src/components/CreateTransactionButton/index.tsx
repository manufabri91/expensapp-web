'use client';
import { HiCheck } from 'react-icons/hi';
import { TransactionForm } from '@/components';
import { Button, ButtonVariant } from '@/components/Button';
import { createTransaction } from '@/lib/actions/transactions';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { Modal, Toast } from 'flowbite-react';
import { useActionState, useEffect, useState } from 'react';
import { useAccounts } from '@/lib/providers/AccountsProvider';

export const CreateTransactionButton = () => {
  const [openForm, setOpenForm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { categories, subcategories } = useCategories();
  const { accounts } = useAccounts();
  const [createdTransaction, createHandler] = useActionState(createTransaction, null);

  useEffect(() => {
    console.log(createdTransaction);
    if (createdTransaction) {
      setToastMessage(`Created transaction with ID: ${createdTransaction.id}`);
    }
    setOpenForm(false);
  }, [createdTransaction]);

  return (
    <>
      {!!toastMessage && (
        <Toast>
          <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="size-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{toastMessage}</div>
          <Toast.Toggle onClick={() => setToastMessage('')} />
        </Toast>
      )}
      <Button
        variant={ButtonVariant.Primary}
        onClick={() => {
          setOpenForm((prev) => !prev);
        }}
      >
        Create Transaction
      </Button>
      <Modal show={openForm} size="md" onClose={() => setOpenForm(false)} popup>
        <Modal.Header as={'div'} className="m-4">
          <h3>Create transaction</h3>
        </Modal.Header>
        <Modal.Body>
          <TransactionForm
            categories={categories}
            subcategories={subcategories}
            accounts={accounts}
            submitHandler={createHandler}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};
