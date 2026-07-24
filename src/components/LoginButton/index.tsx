'use client';

import { Modal } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';

export const LoginButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth.login');

  return (
    <div className={className}>
      <Modal>
        <Button variant="primary">{t('button')}</Button>
        <Modal.Backdrop variant="blur">
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <LoginForm mode="login" />
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};
