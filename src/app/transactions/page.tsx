import { getTranslations } from 'next-intl/server';
import { MonthPicker } from '@/app/transactions/components/MonthPicker';
import { TransactionsTable } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionsFiltersProvider } from '@/lib/providers/TransactionFiltersProvider';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.transactions' });

  return {
    title: {
      default: t('title'),
    },
    description: t('description'),
  };
}

export default async function Transactions() {
  const t = await getTranslations('Transactions');
  return (
    <TransactionsFiltersProvider initialFilters={{ size: 50 }}>
      <TransactionFormProvider>
        <main className="max-w-[100vw] p-6">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h2>
          </div>
          <div className="flex justify-center">
            <MonthPicker />
          </div>
          <TransactionsTable noTransactionsMessage={t('noTransactions')} showPagination />
        </main>
      </TransactionFormProvider>
    </TransactionsFiltersProvider>
  );
}
