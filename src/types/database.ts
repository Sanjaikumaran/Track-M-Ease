export type TransactionType = "in" | "out" | "loan";

export interface Transaction {
  id?: string;

  transaction_date: string;

  type: TransactionType;

  amount: number;

  category: string;

  subcategory?: string;

  person?: string;

  payment_method?: string;

  reason?: string;

  remarks?: string;
}
