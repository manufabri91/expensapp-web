import { formatISO } from 'date-fns';

export interface TransactionFilters {
  currentPage: number;
  totalPages: number;
  size: number;
  sortBy: string;
  ascending: boolean;
  fromDate: Date;
  toDate: Date;
}

export const transactionFiltersToQueryParams = (filters: TransactionFilters) => {
  return `?${new URLSearchParams({
    page: String(filters.currentPage - 1),
    size: String(filters.size ?? 10),
    sort: `${filters.sortBy},${filters.ascending ? 'asc' : 'desc'}`,
    fromDate: formatISO(filters.fromDate),
    toDate: formatISO(filters.toDate),
  }).toString()}&sort=id,desc`;
};
