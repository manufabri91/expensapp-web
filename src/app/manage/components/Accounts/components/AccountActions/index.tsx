'use client';

import { HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { useAccountForm } from '@/components/AccountForm/AccountFormProvider';

export const AccountActions = () => {
  const { showAccountForm } = useAccountForm();
  return (
    <Button
      variant={ButtonVariant.Primary}
      onClick={() => {
        showAccountForm();
      }}
    >
      <HiPlus className="mr-1 size-5" />
      New Account
    </Button>
  );
};
