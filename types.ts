export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVING = 'SAVING'
}

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  currency: 'MMK' | 'THB' | 'USD' | 'SGD';
}

export interface MarketRates {
  THB: number; // 1 THB = ? MMK
  USD: number; // 1 USD = ? MMK
  SGD: number; // 1 SGD = ? MMK
  Gold: number; // 1 Kyattha = ? MMK
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface ExchangeRate {
  from: 'THB' | 'USD' | 'SGD';
  to: 'MMK';
  rate: number;
}