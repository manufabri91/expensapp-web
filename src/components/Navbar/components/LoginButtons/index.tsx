import { Button, ButtonVariant } from '@/components';
import { LoginButton } from '@/components/LoginButton';
import { RegisterButton } from '@/components/RegisterButton';
import { handleLogoutAction } from '@/lib/actions/auth';
import { Session } from 'next-auth';

interface Props {
  session: Session | null;
}

export function LoginButtons({ session }: Props) {
  if (session) {
    return (
      <Button variant={ButtonVariant.Primary} onClick={handleLogoutAction}>
        Log Out
      </Button>
    );
  }

  return (
    <>
      <RegisterButton className="mr-2" />
      <LoginButton />
    </>
  );
}
