'use client';

import { Modal, ModalContent, useDisclosure } from '@heroui/modal';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';

export const LoginButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth.login');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className={className}>
      <Button onPress={onOpen} color="primary">
        {t('button')}
      </Button>
      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>{(onClose) => <LoginForm callback={onClose} mode="login" />}</ModalContent>
      </Modal>
    </div>
  );
};
