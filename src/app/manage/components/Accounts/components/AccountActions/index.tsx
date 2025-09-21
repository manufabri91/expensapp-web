'use client';

import { useTranslations } from 'next-intl';
import { HiPlus } from 'react-icons/hi2';
import { Button } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';

export const AccountActions = () => {
  const t = useTranslations('Generics');
  const { showAccountForm } = useAccountForm();
  return (
    <div>
      <Button
        color="primary"
        onPress={() => {
          showAccountForm();
        }}
      >
        <HiPlus className="mr-1 size-5" />
        {t('new.female')}
      </Button>
    </div>
  );
};
