'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { useFormStatus } from 'react-dom';

interface Props {
  isLoginMode: boolean;
  handleLoginClicked: () => void;
}

export const CTAButton = ({ isLoginMode, handleLoginClicked }: Props) => {
  const { pending } = useFormStatus();
  return (
    <>
      {!pending && (
        <Button variant={ButtonVariant.Primary} className="w-full" type="submit" onClick={handleLoginClicked}>
          {isLoginMode ? 'Log in to your account' : 'Register your account'}
        </Button>
      )}
      {pending && (
        <Button variant={ButtonVariant.Primary} disabled className="w-full" onClick={handleLoginClicked}>
          Loading...
        </Button>
      )}
    </>
  );
};
