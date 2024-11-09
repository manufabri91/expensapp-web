'use client';

import { useState } from 'react';
import { Modal } from 'flowbite-react';

import { Button, ButtonVariant } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';

export const RegisterButton = ({ className }: { className?: string }) => {
  const [openModal, setOpenModal] = useState(false);

  function onCloseModal() {
    setOpenModal(false);
  }

  return (
    <div className={className}>
      <Button variant={ButtonVariant.Secondary} onClick={() => setOpenModal(true)}>
        Register
      </Button>
      <Modal show={openModal} size="lg" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <LoginForm callback={onCloseModal} mode="register" />
        </Modal.Body>
      </Modal>
    </div>
  );
};
