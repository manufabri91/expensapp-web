import { auth } from '@/lib/auth';
import { NavbarContent } from '@/components/Navbar/components/NavbarContent';

export const Navbar = async () => {
  const session = await auth();

  return <NavbarContent session={session} />;
};
