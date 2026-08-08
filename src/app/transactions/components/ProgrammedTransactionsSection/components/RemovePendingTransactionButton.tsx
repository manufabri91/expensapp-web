'use client';
import { useTranslations } from 'next-intl';
import { HiTrash } from 'react-icons/hi2';
import { deleteTransactionById } from '@/lib/actions/transactions';
import { ConfirmActionButton } from './ConfirmActionButton';

interface RemovePendingTransactionButtonProps {
  transactionId: number;
  onChanged: () => void;
}

export const RemovePendingTransactionButton = ({ transactionId, onChanged }: RemovePendingTransactionButtonProps) => {
  const t = useTranslations('ProgrammedTransactions.actions');

  return (
    <ConfirmActionButton
      label={t('remove')}
      icon={HiTrash}
      namespace="ProgrammedTransactions"
      titleKey="removeConfirm.title"
      bodyKey="removeConfirm.body"
      onConfirm={async () => {
        await deleteTransactionById(transactionId);
        onChanged();
      }}
    />
  );
};
