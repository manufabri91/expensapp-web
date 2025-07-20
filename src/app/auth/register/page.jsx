import { LoginForm } from '@/components/LoginForm';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const router = useRouter();
  const handleSuccess = () => {
    router.push('/dashboard');
  };
  return (
    <div className="flex">
      <LoginForm mode="register" callback={handleSuccess} />
    </div>
  );
};

export default RegisterPage;
