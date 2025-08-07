import { Icon } from '@/types/enums/icon';
import { TransactionType } from '@/types/enums/transactionType';

export interface CategoryResponse {
  id: number;
  name: string;
  iconName: Icon;
  color: string | null;
  type: TransactionType;
  readonly?: boolean;
}
