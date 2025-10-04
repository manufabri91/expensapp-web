interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  size: number;
  paged: boolean;
  unpaged: boolean;
}
interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    empty: boolean;
    sorted: boolean;
  };
  empty: boolean;
}
