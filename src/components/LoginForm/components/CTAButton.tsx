'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

interface Props {
  isLoginMode: boolean;
  handleLoginClicked: () => void;
}

export const CTAButton = ({ isLoginMode, handleLoginClicked }: Props) => {
  const t = useTranslations('Auth');
  const { pending } = useFormStatus();
  return (
    <>
      {!pending && (
        <Button variant={ButtonVariant.Primary} className="w-full" type="submit" onClick={handleLoginClicked}>
          {isLoginMode ? t('login.cta') : t('register.cta')}
        </Button>
      )}
      {pending && (
        <Button variant={ButtonVariant.Primary} disabled className="w-full" onClick={handleLoginClicked}>
          {t('form.loading')}
        </Button>
      )}
    </>
  );
};
