'use client';
import { AlertDialog, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import { Button } from '@/components';

interface ConfirmActionButtonProps {
  label: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  titleKey: string;
  bodyKey: string;
  onConfirm: () => Promise<void>;
}

export const ConfirmActionButton = ({ label, icon: Icon, titleKey, bodyKey, onConfirm }: ConfirmActionButtonProps) => {
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
        <Icon className="size-5" />
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
