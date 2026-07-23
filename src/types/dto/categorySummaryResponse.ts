import { AmountPerCurrencyDto } from '@/types/dto/amountPerCurrencyDto';

export interface CategorySummaryResponse {
  id: number;
  name: string;
  color: string | null;
  totals: AmountPerCurrencyDto;
  subTotalsPerSubCategory: Array<{
    id: string;
    name: string;
    subtotals: AmountPerCurrencyDto;
  }>;
}
