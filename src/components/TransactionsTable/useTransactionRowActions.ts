import { toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { TransactionResponse } from '@/types/dto';
import { ActionResult } from '@/types/viewModel/actionResult';

export const useTransactionRowActions = (onDeleted?: () => void) => {
  const t = useTranslations();
  const { showTransactionForm, overlayState } = useTransactionForm();
  const openedTransactionForm = overlayState.isOpen;
  const [changedTransaction, setChangedTransaction] = useState<ActionResult | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  useEffect(() => {
    if (changedTransaction && !changedTransaction.success) {
      toast.danger(t('TransactionForm.unexpectedError'));
    }
  }, [changedTransaction, t]);

  useEffect(() => {
    if (!openedTransactionForm) {
      setIsEditing(null);
    }
  }, [openedTransactionForm]);

  const deleteHandler = async (tx: TransactionResponse) => {
    setIsDeleting(tx.id);
    try {
      const result = await deleteTransactionById(tx.id);
      setChangedTransaction(result);
      toast.success(t('TransactionForm.deletedSuccess', { id: tx.id }));
      onDeleted?.();
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('TransactionForm.unexpectedError'));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const editHandler = async (tx: TransactionResponse) => {
    setIsEditing(tx.id);
    showTransactionForm({ ...tx });
  };

  return { deleteHandler, editHandler, isDeleting, isEditing, showTransactionForm };
};
