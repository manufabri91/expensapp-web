import { endOfMonth, formatISO, isEqual, startOfMonth } from 'date-fns';

export interface TransactionFilters {
  currentPage: number;
  totalPages: number;
  size: number;
  sortBy: string;
  ascending: boolean;
  fromDate: Date;
  toDate: Date;
  categoryIds?: number[];
  subcategoryIds?: number[];
  accountIds?: number[];
}

export const transactionFiltersToQueryParams = (filters: TransactionFilters) => {
  const params = new URLSearchParams();
  params.set('page', String(filters.currentPage - 1));
  params.set('size', String(filters.size ?? 10));
  params.append('sort', `${filters.sortBy},${filters.ascending ? 'asc' : 'desc'}`);
  params.append('sort', 'id,desc');
  params.set('fromDate', formatISO(filters.fromDate));
  params.set('toDate', formatISO(filters.toDate));
  filters.categoryIds?.forEach((id) => params.append('categoryIds', String(id)));
  filters.subcategoryIds?.forEach((id) => params.append('subcategoryIds', String(id)));
  filters.accountIds?.forEach((id) => params.append('accountIds', String(id)));
  return `?${params.toString()}`;
};

export const hasActiveChipFilters = (filters: TransactionFilters): boolean =>
  (filters.categoryIds?.length ?? 0) > 0 ||
  (filters.subcategoryIds?.length ?? 0) > 0 ||
  (filters.accountIds?.length ?? 0) > 0;

export const isCustomDateRange = (filters: TransactionFilters, year: number, month: number): boolean => {
  const monthDate = new Date(year, month - 1);
  return !isEqual(filters.fromDate, startOfMonth(monthDate)) || !isEqual(filters.toDate, endOfMonth(monthDate));
};
