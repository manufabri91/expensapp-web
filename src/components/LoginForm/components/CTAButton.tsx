'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/Button';

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
        <Button color="primary" fullWidth type="submit" onPress={handleLoginClicked}>
          {isLoginMode ? t('login.cta') : t('register.cta')}
        </Button>
      )}
      {pending && (
        <Button isLoading disabled fullWidth onPress={handleLoginClicked}>
          {t('form.loading')}
        </Button>
      )}
    </>
  );
};
