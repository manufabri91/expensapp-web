'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';

import { Button, ButtonVariant } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';
import { useToaster } from '@/components/Toast/ToastProvider';
import { ToastType } from '@/components/Toast';
import { useTranslations } from 'next-intl';

export const RegisterButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth');
  const [openModal, setOpenModal] = useState(false);
  const { showToast } = useToaster();

  const handleRegistrationSuccess = () => {
    showToast(t('register.success'), ToastType.Success);
  };

  const onCloseModal = (succeededRegistration = false) => {
    setOpenModal(false);
    if (succeededRegistration) {
      handleRegistrationSuccess();
    }
  };

  return (
    <div className={className}>
      <Button variant={ButtonVariant.Secondary} onClick={() => setOpenModal(true)}>
        {t('register.button')}
      </Button>
      <Modal show={openModal} size="lg" onClose={() => onCloseModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <LoginForm callback={() => onCloseModal(true)} mode="register" />
        </Modal.Body>
      </Modal>
    </div>
  );
};
