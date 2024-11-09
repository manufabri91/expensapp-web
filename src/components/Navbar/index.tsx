import { auth } from '@/lib/auth';
import { DarkThemeToggle } from 'flowbite-react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthorizedLinks } from './components/AuthorizedLinks';
import { LoginButtons } from './components/LoginButtons';

export const Navbar = async () => {
  const session = await auth();

  return (
    <header className="bg-stone-50 dark:bg-slate-900">
      <div className="mx-auto flex h-16 max-w-full items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/images/logo.png" alt="e-Xpensapp" width={50} height={50} />
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">{session && <AuthorizedLinks />}</div>
        <div className="flex items-center gap-2">
          <LoginButtons session={session} />
          <DarkThemeToggle />
        </div>
      </div>
    </header>
  );
};
