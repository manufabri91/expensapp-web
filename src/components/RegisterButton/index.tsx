'use client';

import { Modal, ModalContent, useDisclosure } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { useTranslations } from 'next-intl';

import { HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';

export const RegisterButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth.register');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleRegistrationSuccess = () => {
    addToast({ title: t('success'), color: 'success' });
  };

  const onCloseModal = (succeededRegistration = false, closeCallback: () => void) => {
    closeCallback();
    if (succeededRegistration) {
      handleRegistrationSuccess();
    }
  };

  return (
    <div className={className}>
      <Button color="primary" variant="bordered" className="bg-white/90 dark:bg-slate-900/90" onPress={() => onOpen()}>
        {t('button')}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} closeButton={<HiXMark size={42} />}>
        <ModalContent>
          {(onClose) => (
            <LoginForm
              callback={() => {
                onCloseModal(true, onClose);
              }}
              mode="register"
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
