import { Suspense } from 'react';
import { Metadata } from 'next';

import { ListSkeleton } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { LatestTransactions } from '@/app/dashboard/components/LatestTransactions';
import { AccountFormProvider } from '@/components/AccountForm/AccountFormProvider';
import { Summary } from '@/app/dashboard/components/Summary';
import LoadingSummary from '@/app/dashboard/components/Summary/loading';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Summary of your account balance, expenses, and investments',
};

const Dashboard = () => {
  return (
    <TransactionFormProvider>
      <AccountFormProvider>
        <main className="max-w-[100vw] p-6">
          <Suspense fallback={<LoadingSummary />}>
            <Summary />
          </Suspense>

          <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">Latest Transactions</h3>
          <Suspense fallback={<ListSkeleton className="mt-4" rows={3} />}>
            <LatestTransactions />
          </Suspense>
        </main>
      </AccountFormProvider>
    </TransactionFormProvider>
  );
};

export default Dashboard;
