import clsx from 'clsx';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    <div className="sm:shadow-base-500/30 bg-background border-divider sm:border-default dark:bg-background fixed inset-x-0 bottom-0 left-0 z-50 mx-auto h-20 w-full overflow-hidden border-t duration-300 hover:shadow-md sm:bottom-5 sm:h-16 sm:max-w-md sm:rounded-xl sm:border sm:shadow-lg lg:hidden">
      <div className="flex w-full items-center justify-evenly p-4 sm:p-2">
        {links.map((link) => (
          <NextLink
            key={link.id}
            href={link.href}
            className={clsx(
              'group inline-flex flex-1 flex-col items-center justify-center gap-1 hover:text-accent',
              pathname.startsWith(link.href)
                ? 'text-accent font-semibold'
                : 'text-foreground'
            )}
          >
            <link.icon className="size-6" />
            <span className="overflow-hidden text-xs text-ellipsis whitespace-nowrap">{t(`links.${link.id}`)}</span>
          </NextLink>
        ))}
      </div>
    </div>
  );
};
