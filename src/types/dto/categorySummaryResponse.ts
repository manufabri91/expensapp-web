export interface CategorySummaryResponse {
  id: number;
  name: string;
  total: number;
  subTotalsPerSubCategory: Array<{
    id: string;
    name: string;
    subtotal: number;
  }>;
}
