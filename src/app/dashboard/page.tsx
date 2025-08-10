import { Suspense } from 'react';
import { ListSkeleton } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { LatestTransactions } from '@/app/dashboard/components/LatestTransactions';
import { AccountFormProvider } from '@/components/AccountForm/AccountFormProvider';
import { Summary } from '@/app/dashboard/components/Summary';
import LoadingSummary from '@/app/dashboard/components/Summary/loading';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.dashboard' });

  return {
    title: {
      default: t('title'),
    },
    description: t('description'),
  };
}

const Dashboard = async () => {
  const t = await getTranslations('Dashboard');
  return (
    <TransactionFormProvider>
      <AccountFormProvider>
        <main className="max-w-[100vw] p-6">
          <Suspense fallback={<LoadingSummary />}>
            <Summary />
          </Suspense>

          <h3 className="mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">
            {t('latestTransactions')}
          </h3>
          <Suspense fallback={<ListSkeleton className="mt-4" rows={3} />}>
            <LatestTransactions />
          </Suspense>
        </main>
      </AccountFormProvider>
    </TransactionFormProvider>
  );
};

export default Dashboard;
