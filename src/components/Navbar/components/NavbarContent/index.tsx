'use client';

import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@heroui/dropdown';
import { Link } from '@heroui/link';
import { useDisclosure } from '@heroui/modal';
import {
  Navbar as HeroUINavbar,
  NavbarContent as HeroUINavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar';
import clsx from 'clsx';

import Image from 'next/image';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';
import { useTranslations } from 'next-intl';
import { Key } from 'react';
import { HiCog, HiOutlineArrowRightStartOnRectangle, HiOutlineUser } from 'react-icons/hi2';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { LoginButtons } from '@/components/Navbar/components/LoginButtons';
import { SettingsDrawer } from '@/components/Navbar/components/SettingsDrawer';
import { handleLogoutAction } from '@/lib/actions/auth';

interface Props {
  session: Session | null;
}

const AUTHORIZED_LINKS = [
  { id: 'dashboard', href: '/dashboard' },
  { id: 'transactions', href: '/transactions' },
  { id: 'manage', href: '/manage' },
];

export const NavbarContent = ({ session }: Props) => {
  const t = useTranslations('Navbar');
  const { onOpen, isOpen, onOpenChange } = useDisclosure();
  const pathname = usePathname();

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
    <HeroUINavbar maxWidth="full" position="sticky" shouldHideOnScroll>
      <HeroUINavbarContent className="basis-full sm:basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <NextLink className="flex items-center justify-start gap-1" href="/">
            <div className="relative mr-2 size-10">
              <Image src="/images/logo.png" className="object-cover" alt="" fill />
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
        </NavbarBrand>
      </HeroUINavbarContent>
      <HeroUINavbarContent justify="center">
        {session && (
          <ul className="ml-2 hidden justify-start gap-6 lg:flex">
            {AUTHORIZED_LINKS.map((link) => (
              <NavbarItem key={link.id} isActive={link.href === pathname}>
                <Link as={NextLink} href={link.href}>
                  {t(`links.${link.id}`)}
                </Link>
              </NavbarItem>
            ))}
          </ul>
        )}
      </HeroUINavbarContent>
      <HeroUINavbarContent className="hidden basis-1/5 sm:flex sm:basis-full" justify="end">
        {!session && (
          <NavbarItem className="hidden gap-2 sm:flex">
            <LocaleSwitcher />
          </NavbarItem>
        )}
        <NavbarItem className="hidden md:flex">
          <LoginButtons session={session} />
        </NavbarItem>
        {session && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={`${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`}
                size="sm"
                src={session.user.imageUrl ?? undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" color="primary" variant="shadow" onAction={menuActionHandler}>
              <DropdownSection showDivider>
                <DropdownItem key="profile" className="h-14 gap-2" isReadOnly>
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user.email}</p>
                </DropdownItem>
              </DropdownSection>
              <DropdownItem key="settings" startContent={<HiCog size={24} />} onPress={onOpen}>
                {t('settings')}
              </DropdownItem>
              <DropdownItem key="configurations" startContent={<HiOutlineUser size={24} />}>
                {t('userAccountSettings')}
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<HiOutlineArrowRightStartOnRectangle size={24} />}
              >
                {t('signOut')}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
        <SettingsDrawer open={isOpen} onClose={onOpenChange} />
      </HeroUINavbarContent>

      <HeroUINavbarContent className="gap-1 sm:hidden" justify="end">
        {!session && <LocaleSwitcher />}
        <LoginButtons session={session} />
        {session && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={`${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`}
                size="sm"
                src={session.user.imageUrl ?? undefined}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" color="primary" variant="shadow" onAction={menuActionHandler}>
              <DropdownSection showDivider>
                <DropdownItem key="profile" className="h-14 gap-2" isReadOnly>
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user.email}</p>
                </DropdownItem>
              </DropdownSection>
              <DropdownItem key="settings" startContent={<HiCog size={24} />} onPress={onOpen}>
                {t('settings')}
              </DropdownItem>
              <DropdownItem key="configurations" startContent={<HiOutlineUser size={24} />}>
                {t('userAccountSettings')}
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<HiOutlineArrowRightStartOnRectangle size={24} />}
              >
                {t('signOut')}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
        {session && <NavbarMenuToggle className="ml-6" />}
      </HeroUINavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {AUTHORIZED_LINKS.map((link) => (
            <NavbarMenuItem key={link.id}>
              <Link href={link.href} size="lg">
                {t(`links.${link.id}`)}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
