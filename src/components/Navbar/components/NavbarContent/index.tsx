'use client';

import Link from 'next/link';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import { LoginButtons } from '@/components/Navbar/components/LoginButtons';
import { handleLogoutAction } from '@/lib/actions/auth';
import { Button, ButtonVariant } from '@/components/Button';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SettingsDrawer } from '@/components/Navbar/components/SettingsDrawer';

interface Props {
  session: Session | null;
}

const AUTHORIZED_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
];

export const NavbarContent = ({ session }: Props) => {
  const [isOpenSettings, setIsOpenSettings] = useState(false);

  const handleSettingsDrawerClose = () => setIsOpenSettings(false);
  const handleSettingsDrawerOpen = () => setIsOpenSettings(true);
  const pathname = usePathname();
  return (
    <>
      <Navbar fluid rounded className="sticky top-0 z-50">
        <Navbar.Brand as={Link} href="/">
          <div className="relative mr-2 size-10">
            <Image src="/images/logo.png" className="object-cover" alt="" fill />
          </div>

          <span className="hidden self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:block">
            e-XpensApp
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2">
          <LoginButtons session={session} />
          {session && (
            <Dropdown arrowIcon={false} inline label={<Avatar alt="User settings" rounded />}>
              <Dropdown.Header>
                <span className="block text-sm">
                  {session.user.firstName} {session.user.lastName}
                </span>
                <span className="block truncate text-sm font-medium">{session.user.email}</span>
              </Dropdown.Header>
              <Dropdown.Item onClick={handleSettingsDrawerOpen}>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <div className="m-3">
                <Button variant={ButtonVariant.Primary} onClick={handleLogoutAction} className="w-full items-center">
                  Log Out
                </Button>
              </div>
            </Dropdown>
          )}
          {session && <Navbar.Toggle className="ml-2" />}
        </div>
        <SettingsDrawer open={isOpenSettings} onClose={handleSettingsDrawerClose} />
        <Navbar.Collapse>
          {session &&
            AUTHORIZED_LINKS.map((link) => (
              <Navbar.Link key={link.label} as={Link} href={link.href} active={link.href === pathname}>
                {link.label}
              </Navbar.Link>
            ))}
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};
