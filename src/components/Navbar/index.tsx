'use client';

import { Button, ButtonType, MenuButton, StyledLink } from '@/components';
import { DarkThemeToggle } from 'flowbite-react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export const Navbar = () => {
  const isLoggedIn = false;

  return (
    <header className="bg-stone-50 dark:bg-slate-900">
      <div className="mx-auto flex h-16 max-w-full items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/images/logo.png" alt="e-Xpensapp" width={50} height={50} />
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          {isLoggedIn && (
            <nav aria-label="Global" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li>
                  <StyledLink href="/dashboard">Dashboard</StyledLink>
                </li>
                <li>
                  <StyledLink href="/transactions">Transactions</StyledLink>
                </li>
                <li>
                  <StyledLink href="/accounts">Accounts</StyledLink>
                </li>
              </ul>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <div className="hidden sm:gap-2 md:flex">
              <Button
                type={ButtonType.Secondary}
                onClick={() => {
                  console.log('Register');
                }}
              >
                Register
              </Button>
              <Button
                type={ButtonType.Primary}
                onClick={() => signIn("credentials", { callbackUrl: "/dashboard" })}
              >
                Login
              </Button>
            </div>
          )}
          <DarkThemeToggle />
          <MenuButton ariaLabel="Toggle Menu" className="md:hidden" />
        </div>
      </div>
    </header>
  );
};
