import clsx from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { IconType } from 'react-icons';

interface Props {
  links: {
    id: string;
    href: string;
    icon: IconType;
  }[];
}

export const MobileNavbar = ({ links }: Props) => {
  const t = useTranslations('Navbar');
  const pathname = usePathname();
  return (
    <div className="sm:shadow-base-500/30 border-t bg-background/90 border-divider fixed inset-x-0 bottom-0 left-0 z-50 mx-auto h-24 sm:h-16 w-full overflow-hidden border-t duration-300 hover:shadow-md sm:bottom-5 sm:max-w-md sm:rounded-xl sm:border sm:border-default sm:shadow-lg lg:hidden dark:bg-background">
      <div className="w-full flex items-center justify-evenly p-4 sm:p-2">
        {links.map((link) => (
          <NextLink key={link.id} href={link.href} className={clsx("group text-base-500 inline-flex flex-col items-center justify-center gap-1 hover:text-primary-700 flex-1", {
            'bg-base-50 text-primary-800 dark:text-primary-500': link.href === pathname,
          })}>
            <link.icon className='size-6' />
            <span className="text-xs text-ellipsis overflow-hidden whitespace-nowrap">{t(`links.${link.id}`)}</span>
          </NextLink>
        ))}
      </div>
    </div>
  );
};
