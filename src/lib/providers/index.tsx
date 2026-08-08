import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { getAccounts } from '@/lib/actions/accounts';
import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { getUserSettings } from '@/lib/actions/userSettings';
import { auth } from '@/lib/auth';
import { hasValidSession } from '@/lib/auth/session';
import { AccountsProvider } from '@/lib/providers/AccountsProvider';
import { CategoriesProvider } from '@/lib/providers/CategoriesProvider';
import { UserSettingsProvider } from '@/lib/providers/UserSettingsProvider';

export const AppProviders = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!hasValidSession(session) || !session.user) {
    if (session?.error) {
      console.error(`[AppProviders] session has error "${session.error}" - skipping data fetch`);
    }
    return <>{children}</>;
  }

  const [categories, subcategories, accounts, userSettings] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getAccounts(),
    getUserSettings(),
  ]);

  return (
    <SessionProvider session={session}>
      <UserSettingsProvider initialSettings={userSettings}>
        <AccountsProvider initialAccounts={accounts}>
          <CategoriesProvider initialCategories={categories} initialSubcategories={subcategories}>
            {children}
          </CategoriesProvider>
        </AccountsProvider>
      </UserSettingsProvider>
    </SessionProvider>
  );
};
