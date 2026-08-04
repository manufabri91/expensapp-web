import { TransactionsTable } from '@/components/TransactionsTable';
import { getInitialTransactionsPage } from '@/lib/actions/transactions';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

interface Props {
  filters: TransactionFilters;
  noTransactionsMessage?: string;
}

export const TransactionsTableSection = async ({ filters, noTransactionsMessage }: Props) => {
  const initialData = await getInitialTransactionsPage(filters);

  return <TransactionsTable initialData={initialData} noTransactionsMessage={noTransactionsMessage} showPagination />;
};
