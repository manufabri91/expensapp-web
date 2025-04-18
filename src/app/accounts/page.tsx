import { Toast } from '@/components';
import { AccountFormProvider } from '@/components/AccountForm/AccountFormProvider';
import { AccountsDetails } from '@/app/accounts/components/AccountsDetails';
import { AccountActions } from '@/app/accounts/components/AccountActions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts',
  description: 'Manage your accounts',
};

export default function AccountsPage() {
  return (
    <AccountFormProvider>
      <main className="max-w-[100vw] p-6">
        <Toast />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Accounts Overview</h2>
        <div className="my-8 flex justify-end gap-4 md:my-16">
          <AccountActions />
        </div>
        <AccountsDetails />
      </main>
    </AccountFormProvider>
  );
}
