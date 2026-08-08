'use client';
import { useTranslations } from 'next-intl';
import { HiTrash } from 'react-icons/hi2';
import { deleteRecurringTransactionById } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { ConfirmActionButton } from './ConfirmActionButton';

interface DeleteRecurringTransactionButtonProps {
  recurrence: RecurringTransactionResponse;
  onChanged: () => void;
}

export const DeleteRecurringTransactionButton = ({
  recurrence,
  onChanged,
}: DeleteRecurringTransactionButtonProps) => {
  const t = useTranslations('RecurringTransactions.actions');

  return (
    <ConfirmActionButton
      label={t('delete')}
      icon={HiTrash}
      titleKey="deleteConfirm.title"
      bodyKey="deleteConfirm.body"
      onConfirm={async () => {
        await deleteRecurringTransactionById(recurrence.id);
        onChanged();
      }}
    />
  );
};
