'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';

import { Button, ButtonVariant } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';
import { useTranslations } from 'next-intl';

export const LoginButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth.login');
  const [openModal, setOpenModal] = useState(false);

  const onCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className={className}>
      <Button variant={ButtonVariant.Primary} onClick={() => setOpenModal(true)}>
        {t('button')}
      </Button>
      <Modal show={openModal} size="lg" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <LoginForm callback={onCloseModal} mode="login" />
        </Modal.Body>
      </Modal>
    </div>
  );
};
