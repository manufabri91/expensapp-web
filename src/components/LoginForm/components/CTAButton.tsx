'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/Button';

interface Props {
  isLoginMode: boolean;
  handleLoginClicked: () => void;
  isSubmitting: boolean;
}

export const CTAButton = ({ isLoginMode, handleLoginClicked, isSubmitting }: Props) => {
  const t = useTranslations('Auth');
  return (
    <>
      {!isSubmitting && (
        <Button variant="primary" type="submit" fullWidth onPress={handleLoginClicked}>
          {isLoginMode ? t('login.cta') : t('register.cta')}
        </Button>
      )}
      {isSubmitting && (
        <Button isDisabled fullWidth onPress={handleLoginClicked}>
          {t('form.loading')}
        </Button>
      )}
    </>
  );
};
