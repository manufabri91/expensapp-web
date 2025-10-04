export interface TransactionFilters {
  currentPage: number;
  totalPages: number;
  size: number;
  sortBy: string;
  ascending: boolean;
  fromDate: Date;
  toDate: Date;
}
