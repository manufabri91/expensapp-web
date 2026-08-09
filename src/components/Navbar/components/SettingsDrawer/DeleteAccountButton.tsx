'use client';
import { AlertDialog, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiTrash } from 'react-icons/hi2';
import { Button } from '@/components';
import { clientLogout } from '@/lib/auth/clientLogout';

export const DeleteAccountButton = () => {
  const t = useTranslations('Settings');
  const tGenerics = useTranslations('Generics');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/privacy/delete-account', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(t('deleteAccountFailed'));
      }
      await clientLogout();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('deleteAccountFailed'));
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="danger" onPress={() => setIsOpen(true)} fullWidth>
        <HiTrash className="size-5" />
        {t('deleteMyAccount')}
      </Button>
      <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{t('deleteAccountConfirm.title')}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{t('deleteAccountConfirm.body')}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="secondary" onPress={() => setIsOpen(false)} isDisabled={isSubmitting}>
                {tGenerics('cancel')}
              </Button>
              <Button variant="danger" onPress={handleConfirm} isDisabled={isSubmitting}>
                {isSubmitting ? `${t('deleteMyAccount')}...` : t('deleteMyAccount')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
};
