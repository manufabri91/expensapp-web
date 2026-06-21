'use client';

import { Modal, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';
import { LoginForm } from '@/components/LoginForm';

export const RegisterButton = ({ className }: { className?: string }) => {
  const t = useTranslations('Auth.register');

  return (
    <div className={className}>
      <Modal>
        <Button variant="outline" className="bg-white/90 dark:bg-slate-900/90">
          {t('button')}
        </Button>
        <Modal.Backdrop variant="blur">
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <LoginForm
                callback={() => {
                  toast.success(t('success'));
                }}
                mode="register"
              />
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};
