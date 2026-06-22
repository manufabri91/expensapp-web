'use client';

import { Avatar, Dropdown, useOverlayState } from '@heroui/react';
import clsx from 'clsx';

import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';
import { Key, useEffect, useState } from 'react';
import { HiCog, HiHome, HiOutlineArrowRightStartOnRectangle, HiOutlineDocumentCurrencyDollar, HiOutlineUser, HiWallet } from 'react-icons/hi2';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { LoginButtons } from '@/components/Navbar/components/LoginButtons';
import { MobileNavbar } from '@/components/Navbar/components/MobileNavbar/MobileNavbar';
import { SettingsDrawer } from '@/components/Navbar/components/SettingsDrawer';
import { handleLogoutAction } from '@/lib/actions/auth';

interface Props {
  session: Session | null;
}

const AUTHORIZED_LINKS = [
  { id: 'dashboard', href: '/dashboard', icon: HiHome },
  { id: 'transactions', href: '/transactions', icon: HiOutlineDocumentCurrencyDollar },
  { id: 'manage', href: '/manage', icon: HiWallet },
];

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 64);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return hidden;
}

function ProfileDropdown({
  session,
  onSettingsOpen,
  menuActionHandler,
}: {
  session: Session;
  onSettingsOpen: () => void;
  menuActionHandler: (key: Key) => void;
}) {
  const t = useTranslations('Navbar');

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Avatar
          className="cursor-pointer transition-transform ring-2 ring-accent"
          size="sm"
        >
          <Avatar.Image src={session.user.imageUrl ?? undefined} />
          <Avatar.Fallback>{`${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Profile Actions" onAction={menuActionHandler}>
          <Dropdown.Section>
            <Dropdown.Item id="profile" textValue="Profile">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{session.user.email}</p>
            </Dropdown.Item>
          </Dropdown.Section>
          <Dropdown.Section>
            <Dropdown.Item id="settings" textValue={t('settings')} onPress={onSettingsOpen}>
              <HiCog size={24} className="inline mr-2" />
              {t('settings')}
            </Dropdown.Item>
            <Dropdown.Item id="configurations" textValue={t('userAccountSettings')}>
              <HiOutlineUser size={24} className="inline mr-2" />
              {t('userAccountSettings')}
            </Dropdown.Item>
            <Dropdown.Item id="logout" textValue={t('signOut')} className="text-danger">
              <HiOutlineArrowRightStartOnRectangle size={24} className="inline mr-2" />
              {t('signOut')}
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export const NavbarContent = ({ session }: Props) => {
  const t = useTranslations('Navbar');
  const drawerState = useOverlayState();
  const pathname = usePathname();
  const hidden = useHideOnScroll();

  const menuActionHandler = (key: Key) => {
    const actionMappings = {
      logout: handleLogoutAction,
    };
    const action = actionMappings[key as keyof typeof actionMappings];
    if (action) {
      action();
    }
  };

  return (
    <>
      <nav
        className={clsx(
          'sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg transition-transform duration-300',
          hidden && '-translate-y-full'
        )}
      >
        <header className="mx-auto flex h-16 max-w-full items-center justify-between px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <NextLink className="flex items-center justify-start gap-1" href="/">
              <div className="relative mr-2 size-10">
                <Image src="/images/logo.png" className="object-cover" alt="" fill sizes="40px" />
              </div>
              <span
                className={clsx({
                  'font-brand self-center text-3xl font-semibold whitespace-nowrap dark:text-white': true,
                  'hidden sm:block': !session,
                  block: session,
                })}
              >
                e-<span className="text-[#2acfb9]">X</span>pens
              </span>
            </NextLink>
          </div>

          {/* Center nav links (desktop) */}
          {session && (
            <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
              {AUTHORIZED_LINKS.map((link) => (
                <li key={link.id}>
                  <NextLink
                    href={link.href}
                    className={clsx(
                      'text-accent hover:underline',
                      link.href === pathname && 'font-semibold'
                    )}
                  >
                    {t(`links.${link.id}`)}
                  </NextLink>
                </li>
              ))}
            </ul>
          )}

          {/* Right side (desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            {!session && (
              <div className="hidden gap-2 sm:flex">
                <LocaleSwitcher />
              </div>
            )}
            <div className="hidden md:flex">
              <LoginButtons session={session} />
            </div>
            {session && (
              <ProfileDropdown
                session={session}
                onSettingsOpen={drawerState.open}
                menuActionHandler={menuActionHandler}
              />
            )}
          </div>

          {/* Right side (mobile) */}
          <div className="flex items-center gap-1 sm:hidden">
            {!session && <LocaleSwitcher />}
            <LoginButtons session={session} />
            {session && (
              <ProfileDropdown
                session={session}
                onSettingsOpen={drawerState.open}
                menuActionHandler={menuActionHandler}
              />
            )}
          </div>
        </header>
      </nav>

      <SettingsDrawer state={drawerState} />

      {session && <MobileNavbar links={AUTHORIZED_LINKS} />}
    </>
  );
};
