'use client';
import { Spinner, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { Button } from '@/components';
import { confirmTransaction } from '@/lib/actions/transactions';

interface ConfirmPendingTransactionButtonProps {
  transactionId: number;
  onChanged: () => void;
}

export const ConfirmPendingTransactionButton = ({
  transactionId,
  onChanged,
}: ConfirmPendingTransactionButtonProps) => {
  const t = useTranslations('ProgrammedTransactions.actions');
  const tGenerics = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePress = async () => {
    setIsSubmitting(true);
    try {
      await confirmTransaction(transactionId);
      onChanged();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : tGenerics('TransactionForm.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" onPress={handlePress} isDisabled={isSubmitting}>
      {isSubmitting ? <Spinner className="size-5" /> : <HiCheck className="size-5" />}
      <span className="hidden md:block">{t('confirm')}</span>
    </Button>
  );
};
