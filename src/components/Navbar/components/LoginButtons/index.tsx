'use client';

import { Button, ButtonVariant } from '@/components';
import { handleLogout } from '@/lib/actions/auth';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

interface Props {
  session: Session | null;
}

export const LoginButtons = ({ session }: Props) => {
  const router = useRouter();
  if (session) {
    return (
      <Button variant={ButtonVariant.Primary} onClick={handleLogout}>
        Log Out
      </Button>
    );
  }

  return (
    <div className="hidden sm:gap-2 md:flex">
      <Button variant={ButtonVariant.Secondary} onClick={() => router.push('/auth/register')}>
        Register
      </Button>
      <Button variant={ButtonVariant.Primary} onClick={() => router.push('/auth/signin')}>
        Login
      </Button>
    </div>
  );
};
