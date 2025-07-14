export type CategoryType = 'revenus' | 'factures' | 'dépenses' | 'épargnes';
export type TransactionType = 'revenus' | 'factures' | 'dépenses' | 'épargnes' | 'transfert';

export interface User {
  id: number;
  username: string;
  email: string;
  github_id: string;
  budget_start_date?: string;
  starts_before_month: boolean;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  is_credit: boolean;
  sort_order: number;
}

export interface Account {
  id: number;
  name: string;
  initial_balance: number;
  current_balance: number;
  is_savings_account: boolean;
  is_main_account: boolean;
}

export interface Transaction {
  id: number;
  is_processed: boolean;
  date: string;
  amount: number;
  type: TransactionType;
  category_id?: number;
  account_from_id: number;
  account_to_id: number;
  description: string;
}

export interface BudgetForecast {
  id: number;
  month_number: number;
  category_id: number;
  forecasted_amount: number;
}

export interface MemoItem {
  id: number;
  month_number: number;
  description: string;
  amount: number;
  is_paid: boolean;
}

export interface SavingsAllocation {
  id: number;
  amount: number;
  category_id: number;
  account_id: number;
}

export interface SavingsGoal {
  id: number;
  category_id: number;
  target_amount: number;
}

export interface CreditDetail {
  id: number;
  category_id: number;
  borrowed_amount: number;
  interest_amount: number;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  already_repaid: number;
}

export interface Config {
  budget_start_date?: string;
  starts_before_month: boolean;
  categories: Category[];
  accounts: Account[];
  savings_allocations: SavingsAllocation[];
}

export interface BudgetData {
  period: {
    start_date: string;
    end_date: string;
    month: number;
    year: number;
  };
  categories: Record<number, {
    category_name: string;
    category_type: CategoryType;
    forecasted: number;
    real: number;
    variance: number;
    variance_percent: number;
  }>;
}

export interface BudgetSummary {
  revenus: { forecasted: number; real: number; variance: number };
  factures: { forecasted: number; real: number; variance: number };
  dépenses: { forecasted: number; real: number; variance: number };
  épargnes: { forecasted: number; real: number; variance: number };
}

export interface Balances {
  real: Record<number, number>;
  upcoming: Record<number, number>;
  pending: Record<number, number>;
}

export interface Treasury {
  total_real: number;
  total_upcoming: number;
  total_pending: number;
}