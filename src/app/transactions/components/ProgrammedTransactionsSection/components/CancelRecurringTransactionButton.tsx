'use client';
import { useTranslations } from 'next-intl';
import { HiXMark } from 'react-icons/hi2';
import { cancelRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { ConfirmActionButton } from './ConfirmActionButton';

interface CancelRecurringTransactionButtonProps {
  recurrence: RecurringTransactionResponse;
  onChanged: () => void;
}

export const CancelRecurringTransactionButton = ({
  recurrence,
  onChanged,
}: CancelRecurringTransactionButtonProps) => {
  const t = useTranslations('RecurringTransactions.actions');

  return (
    <ConfirmActionButton
      label={t('cancel')}
      icon={HiXMark}
      titleKey="cancelConfirm.title"
      bodyKey="cancelConfirm.body"
      onConfirm={async () => {
        await cancelRecurringTransaction(recurrence.id);
        onChanged();
      }}
    />
  );
};
