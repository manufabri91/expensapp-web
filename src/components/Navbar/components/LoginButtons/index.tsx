import { LoginButton } from '@/components/LoginButton';
import { RegisterButton } from '@/components/RegisterButton';
import { Session } from 'next-auth';

interface Props {
  session: Session | null;
}

export function LoginButtons({ session }: Props) {
  if (session) {
    return null;
  }

  return (
    <>
      <RegisterButton className="mr-2" />
      <LoginButton />
    </>
  );
}
