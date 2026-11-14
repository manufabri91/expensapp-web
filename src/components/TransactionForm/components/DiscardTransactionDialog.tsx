import { AlertDialog } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';

export const DiscardTransactionDialog = ({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) => {
  const t = useTranslations('AmountFlow');
  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        isOpen={open}
        onOpenChange={(next) => {
          if (!next) onKeep();
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>{t('discardTitle')}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{t('discardBody')}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button type="button" variant="secondary" autoFocus onPress={onKeep}>
                {t('keepEditing')}
              </Button>
              <Button type="button" variant="danger" onPress={onDiscard}>
                {t('discard')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
};
