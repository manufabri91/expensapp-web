export interface TransactionRequest {
  id?: number;
  amount: number;
  eventDate?: string | null;
  description: string;
  accountId: number;
  categoryId: number;
  subcategoryId: number;
}
