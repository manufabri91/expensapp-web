import { AccountsDetails } from '@/app/dashboard/components/AccountsDetails';
import { LatestTransactions } from '@/app/dashboard/components/LatestTransactions';
import { CardSkeleton, ListSkeleton } from '@/components';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Summary of your account balance, expenses, and investments',
};

const Dashboard = () => {
  return (
    <main className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Accounts Overview</h2>
      <Suspense fallback={<CardSkeleton className="mt-4" />}>
        <AccountsDetails />
      </Suspense>

      <h2 className="mt-14 text-2xl font-semibold text-gray-800 dark:text-gray-100">Latest Transactions</h2>
      <Suspense fallback={<ListSkeleton className="mt-4" rows={3} />}>
        <LatestTransactions />
      </Suspense>
    </main>
  );
};

export default Dashboard;
