import { NavbarContent } from '@/components/Navbar/components/NavbarContent';
import { auth } from '@/lib/auth';

export const Navbar = async () => {
  const session = await auth();

  return <NavbarContent session={session} />;
};
