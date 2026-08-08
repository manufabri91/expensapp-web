import useSWR from 'swr';
import { getProgrammedTransactions } from '@/lib/actions/summaries';
import { ProgrammedTransactionsResponse } from '@/types/dto';

export const useProgrammedTransactions = (initialData?: ProgrammedTransactionsResponse) =>
  useSWR('/api/summary/programmed-transactions', getProgrammedTransactions, { fallbackData: initialData });
