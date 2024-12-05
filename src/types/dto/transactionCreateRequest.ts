export interface TransactionCreateRequest {
  amount: number;
  eventDate?: string | null;
  description: string;
  accountId: number;
  categoryId: number;
  subcategoryId: number;
}
