import { Metadata } from 'next';
import { ListSkeleton, Toast } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { Suspense } from 'react';
import { LatestTransactions } from '@/app/transactions/components/LatestTransactions';
import { MonthPicker } from '@/app/transactions/components/MonthPicker';

export const metadata: Metadata = {
  title: 'Transactions',
  description: 'List of all your transactions',
};

export default function Transactions() {
  return (
    <TransactionFormProvider>
      <main className="max-w-[100vw] p-6">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Transactions</h2>
        </div>
        <div className="flex justify-center">
          <MonthPicker />
        </div>
        <div className="mt-4">
          <Suspense fallback={<ListSkeleton rows={3} />}>
            <LatestTransactions />
          </Suspense>
        </div>
      </main>
    </TransactionFormProvider>
  );
}
