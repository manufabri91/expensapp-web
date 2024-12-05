import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { auth } from '@/lib/auth';
import { AccountsProvider } from '@/lib/providers/AccountsProvider';
import { CategoriesProvider } from '@/lib/providers/CategoriesProvider';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export const AppProviders = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session || !session.user) {
    return <>{children}</>;
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
