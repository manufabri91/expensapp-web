import { Session } from 'next-auth';
import { LoginButton } from '@/components/LoginButton';
import { RegisterButton } from '@/components/RegisterButton';

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
