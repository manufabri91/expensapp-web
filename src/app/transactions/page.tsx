import { endOfMonth, startOfMonth } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import LoadingSummary from '@/app/dashboard/components/Summary/loading';
import { MonthSummary } from '@/app/transactions/components/MonthSummary';
import { ProgrammedTransactionsSectionServer } from '@/app/transactions/components/ProgrammedTransactionsSection/ProgrammedTransactionsSectionServer';
import { CardSkeleton, ListSkeleton } from '@/components';
import { TransactionFormProvider } from '@/components/TransactionForm/TransactionFormProvider';
import { TransactionsTableSection } from '@/components/TransactionsTable/TransactionsTableSection';
import { TransactionsFiltersProvider } from '@/lib/providers/TransactionFiltersProvider';
import { getYearMonthFromParams } from '@/lib/utils/date';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

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
  const initialTableFilters: TransactionFilters = {
    fromDate,
    toDate,
    size: 50,
    currentPage: 1,
    totalPages: 1,
    sortBy: 'eventDate',
    ascending: false,
  };

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
            <Suspense fallback={<CardSkeleton />}>
              <ProgrammedTransactionsSectionServer />
            </Suspense>
          </div>
          <Suspense fallback={<ListSkeleton rows={10} />}>
            <TransactionsTableSection filters={initialTableFilters} noTransactionsMessage={t('noTransactions')} />
          </Suspense>
        </main>
      </TransactionFormProvider>
    </TransactionsFiltersProvider>
  );
}
