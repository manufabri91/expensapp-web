import { NavbarContent } from '@/components/Navbar/components/NavbarContent';
import { auth } from '@/lib/auth';
import { hasValidSession } from '@/lib/auth/session';

export const Navbar = async () => {
  const session = await auth();

  // NavbarContent/LoginButtons/ProfileDropdown all gate purely on session truthiness, so an
  // errored session (stale user data, see hasValidSession) has to be normalized to "logged out"
  // here for display rather than passed through as-is.
  return <NavbarContent session={hasValidSession(session) ? session : null} />;
};
