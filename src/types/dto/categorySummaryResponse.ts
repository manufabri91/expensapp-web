import { AmountPerCurrencyDto } from '@/types/dto/amountPerCurrencyDto';

export interface CategorySummaryResponse {
  id: number;
  name: string;
  totals: AmountPerCurrencyDto;
  subTotalsPerSubCategory: Array<{
    id: string;
    name: string;
    subtotals: AmountPerCurrencyDto;
  }>;
}
