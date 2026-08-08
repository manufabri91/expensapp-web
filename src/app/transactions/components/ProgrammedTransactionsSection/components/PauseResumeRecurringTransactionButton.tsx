'use client';
import { Spinner, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiPause, HiPlay } from 'react-icons/hi2';
import { Button } from '@/components';
import { pauseRecurringTransaction, resumeRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';

interface PauseResumeRecurringTransactionButtonProps {
  recurrence: RecurringTransactionResponse;
  onChanged: () => void;
}

export const PauseResumeRecurringTransactionButton = ({
  recurrence,
  onChanged,
}: PauseResumeRecurringTransactionButtonProps) => {
  const t = useTranslations('RecurringTransactions.actions');
  const tGenerics = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPaused = recurrence.status === RecurrenceStatus.PAUSED;

  const handlePress = async () => {
    setIsSubmitting(true);
    try {
      if (isPaused) {
        await resumeRecurringTransaction(recurrence.id);
      } else {
        await pauseRecurringTransaction(recurrence.id);
      }
      onChanged();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : tGenerics('TransactionForm.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" onPress={handlePress} isDisabled={isSubmitting}>
      {isSubmitting ? (
        <Spinner className="size-5" />
      ) : isPaused ? (
        <HiPlay className="size-5" />
      ) : (
        <HiPause className="size-5" />
      )}
      <span className="hidden md:block">{isPaused ? t('resume') : t('pause')}</span>
    </Button>
  );
};
