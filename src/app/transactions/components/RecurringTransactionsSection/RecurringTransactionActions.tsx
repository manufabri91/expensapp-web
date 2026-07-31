'use client';
import { AlertDialog, Spinner, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import { HiPause, HiPencil, HiPlay, HiTrash, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import {
  cancelRecurringTransaction,
  deleteRecurringTransactionById,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
} from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';

interface RecurrenceActionProps {
  recurrence: RecurringTransactionResponse;
  onChanged: () => void;
}

export const EditRecurringTransactionButton = ({ recurrence }: Pick<RecurrenceActionProps, 'recurrence'>) => {
  const t = useTranslations('Generics');
  const { showRecurringTransactionForm } = useTransactionForm();

  return (
    <Button size="sm" variant="secondary" onPress={() => showRecurringTransactionForm(recurrence)}>
      <HiPencil className="mr-1 size-5" />
      <span className="hidden md:block">{t('edit')}</span>
    </Button>
  );
};

export const PauseResumeRecurringTransactionButton = ({ recurrence, onChanged }: RecurrenceActionProps) => {
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
        <Spinner className="mr-1 size-5" />
      ) : isPaused ? (
        <HiPlay className="mr-1 size-5" />
      ) : (
        <HiPause className="mr-1 size-5" />
      )}
      <span className="hidden md:block">{isPaused ? t('resume') : t('pause')}</span>
    </Button>
  );
};

interface ConfirmActionButtonProps {
  label: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  titleKey: string;
  bodyKey: string;
  onConfirm: () => Promise<void>;
}

const ConfirmActionButton = ({ label, icon: Icon, titleKey, bodyKey, onConfirm }: ConfirmActionButtonProps) => {
  const t = useTranslations('RecurringTransactions');
  const tGenerics = useTranslations('Generics');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="danger" onPress={() => setIsOpen(true)}>
        <Icon className="mr-1 size-5" />
        <span className="hidden md:block">{label}</span>
      </Button>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{t(titleKey)}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{t(bodyKey)}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="secondary" onPress={() => setIsOpen(false)} isDisabled={isSubmitting}>
                {tGenerics('cancel')}
              </Button>
              <Button variant="danger" onPress={handleConfirm} isDisabled={isSubmitting}>
                {isSubmitting ? `${tGenerics('deleting')}...` : label}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
};

export const CancelRecurringTransactionButton = ({ recurrence, onChanged }: RecurrenceActionProps) => {
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

export const DeleteRecurringTransactionButton = ({ recurrence, onChanged }: RecurrenceActionProps) => {
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
