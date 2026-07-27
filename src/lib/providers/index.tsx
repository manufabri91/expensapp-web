import { SessionProvider } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { auth } from '@/lib/auth';
import { AccountsProvider } from '@/lib/providers/AccountsProvider';
import { CategoriesProvider } from '@/lib/providers/CategoriesProvider';
import { HOME } from '@/lib/routes';

export const AppProviders = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session || !session.user) {
    return <>{children}</>;
  }

  if (session.error) {
    // The jwt() callback in src/lib/auth/config.ts already tried and failed to refresh this
    // session, so session.user.token is a known-stale bearer token. Force the user back to
    // sign-in here (matching NextAuth's own recommended pattern) instead of letting
    // Promise.all below reach backendFetch with it, which throws deep inside a server action
    // and surfaces as an uncaught crash rather than a clean redirect.
    console.error(`[AppProviders] session has error "${session.error}" - redirecting to sign-in`);
    redirect(HOME);
  }

  const [categories, subcategories, accounts] = await Promise.all([getCategories(), getSubcategories(), getAccounts()]);

  return (
    <SessionProvider session={session}>
      <AccountsProvider initialAccounts={accounts}>
        <CategoriesProvider initialCategories={categories} initialSubcategories={subcategories}>
          {children}
        </CategoriesProvider>
      </AccountsProvider>
    </SessionProvider>
  );
};
