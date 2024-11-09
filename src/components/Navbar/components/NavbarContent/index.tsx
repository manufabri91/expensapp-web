'use client';

import Link from 'next/link';
import { DarkThemeToggle, Navbar } from 'flowbite-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import { LoginButtons } from '@/components/Navbar/components/LoginButtons';

interface Props {
  session: Session | null;
}

const AUTHORIZED_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
];

export const NavbarContent = ({ session }: Props) => {
  return (
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
        {session && <Navbar.Toggle className="ml-2" />}
        <DarkThemeToggle />
      </div>
      <Navbar.Collapse>
        {session &&
          AUTHORIZED_LINKS.map((link) => (
            <Navbar.Link key={link.label} as={Link} href={link.href}>
              {link.label}
            </Navbar.Link>
          ))}
      </Navbar.Collapse>
    </Navbar>
  );
};
