import { CategoryResponse, SubCategoryResponse } from '@/types/dto';
import { LinkedTransactionResponse } from '@/types/dto/linkedTransactionResponse';
import { TransactionType } from '@/types/enums/transactionType';

export interface TransactionResponse {
  id: number;
  eventDate: string;
  description: string;
  amount: number;
  type: TransactionType;
  currencyCode: string;
  accountId: number;
  accountName: string;
  category: CategoryResponse;
  subcategory: SubCategoryResponse;
  excludeFromTotals: boolean;
  linkedTransaction: LinkedTransactionResponse | null;
}
