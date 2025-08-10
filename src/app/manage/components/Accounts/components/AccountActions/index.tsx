'use client';

import { HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';
import { useTranslations } from 'next-intl';

export const AccountActions = () => {
  const t = useTranslations('Generics');
  const { showAccountForm } = useAccountForm();
  return (
    <div>
      <Button
        variant={ButtonVariant.Primary}
        onClick={() => {
          showAccountForm();
        }}
      >
        <HiPlus className="mr-1 size-5" />
        {t('new.female')}
      </Button>
    </div>
  );
};
