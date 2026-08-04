import { InfiniteTransactionsTable } from '@/components/TransactionsTable/InfiniteTransactionsTable';
import { getInitialTransactionsPage } from '@/lib/actions/transactions';
import { TransactionFilters } from '@/types/viewModel/transactionFilters';

interface Props {
  filters: TransactionFilters;
  noTransactionsMessage?: string;
}

export const InfiniteTransactionsTableSection = async ({ filters, noTransactionsMessage }: Props) => {
  const initialData = await getInitialTransactionsPage(filters);

  return <InfiniteTransactionsTable initialData={initialData} noTransactionsMessage={noTransactionsMessage} />;
};
