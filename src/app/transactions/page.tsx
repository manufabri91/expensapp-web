import { endOfMonth, startOfMonth } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import LoadingSummary from '@/app/dashboard/components/Summary/loading';
import { MonthSummary } from '@/app/transactions/components/MonthSummary';
import { RecurringTransactionsSection } from '@/app/transactions/components/RecurringTransactionsSection';
import { TransactionsTable } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionsFiltersProvider } from '@/lib/providers/TransactionFiltersProvider';
import { getYearMonthFromParams } from '@/lib/utils/date';

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

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function Transactions({ searchParams }: Props) {
  const t = await getTranslations('Transactions');
  const { year: yearParam, month: monthParam } = await searchParams;
  const { year, month } = getYearMonthFromParams(yearParam, monthParam);
  const fromDate = startOfMonth(new Date(year, month - 1));
  const toDate = endOfMonth(new Date(year, month - 1));

  return (
    <TransactionsFiltersProvider initialFilters={{ size: 50, fromDate, toDate }}>
      <TransactionFormProvider>
        <main className="max-w-[100vw] p-6">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h2>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <Suspense fallback={<LoadingSummary />}>
              <MonthSummary year={year} month={month} />
            </Suspense>
            <RecurringTransactionsSection />
          </div>
          <TransactionsTable noTransactionsMessage={t('noTransactions')} showPagination />
        </main>
      </TransactionFormProvider>
    </TransactionsFiltersProvider>
  );
}
