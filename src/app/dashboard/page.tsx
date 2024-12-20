import { Suspense } from 'react';
import { Metadata } from 'next';

import { AccountsDetails } from '@/app/dashboard/components/AccountsDetails';
import { LatestTransactions } from '@/app/dashboard/components/LatestTransactions';
import { CardSkeleton, ListSkeleton, Toast, TransactionForm } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Summary of your account balance, expenses, and investments',
};

const Dashboard = () => {
  return (
    <TransactionFormProvider>
      <main className="p-6">
        <Toast />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Accounts Overview</h2>
        <Suspense fallback={<CardSkeleton className="mt-4" />}>
          <AccountsDetails />
        </Suspense>

        <div className="flex items-end gap-4">
          <h2 className="mt-14 text-2xl font-semibold text-gray-800 dark:text-gray-100">Latest Transactions</h2>
          <div>{/* <CreateTransactionButton iconOnly /> */}</div>
        </div>
        <Suspense fallback={<ListSkeleton className="mt-4" rows={3} />}>
          <LatestTransactions />
        </Suspense>
      </main>
      <TransactionForm />
    </TransactionFormProvider>
  );
};

export default Dashboard;
