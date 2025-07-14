import axios from 'axios';
import { User, Config, Transaction, BudgetData, BudgetSummary, Balances, Treasury } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  getCurrentUser: () => api.get<User>('/auth/me'),
  githubLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },
};

export const configApi = {
  getConfig: () => api.get<Config>('/config/'),
  updateStartDate: (data: { budget_start_date?: string; starts_before_month: boolean }) =>
    api.put('/config/start-date', data),
  createCategory: (data: { name: string; type: string; is_credit?: boolean; sort_order?: number }) =>
    api.post('/config/categories', data),
  updateCategory: (id: number, data: { name?: string; is_credit?: boolean; sort_order?: number }) =>
    api.put(`/config/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/config/categories/${id}`),
  createAccount: (data: { name: string; initial_balance: number; is_savings_account?: boolean; is_main_account?: boolean }) =>
    api.post('/config/accounts', data),
  updateAccount: (id: number, data: { name?: string; initial_balance?: number; is_savings_account?: boolean; is_main_account?: boolean }) =>
    api.put(`/config/accounts/${id}`, data),
  deleteAccount: (id: number) => api.delete(`/config/accounts/${id}`),
  createSavingsAllocation: (data: { amount: number; category_id: number; account_id: number }) =>
    api.post('/config/savings-allocations', data),
};

export const transactionsApi = {
  getTransactions: (params?: {
    skip?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
    account_id?: number;
    category_id?: number;
    transaction_type?: string;
    processed_only?: boolean;
  }) => api.get<Transaction[]>('/transactions/', { params }),
  
  createTransaction: (data: {
    is_processed?: boolean;
    date: string;
    amount: number;
    type: string;
    category_id?: number;
    account_from_id: number;
    account_to_id: number;
    description: string;
  }) => api.post<Transaction>('/transactions/', data),
  
  updateTransaction: (id: number, data: {
    is_processed?: boolean;
    date?: string;
    amount?: number;
    type?: string;
    category_id?: number;
    account_from_id?: number;
    account_to_id?: number;
    description?: string;
  }) => api.put<Transaction>(`/transactions/${id}`, data),
  
  deleteTransaction: (id: number) => api.delete(`/transactions/${id}`),
  
  toggleProcessing: (id: number) => api.patch(`/transactions/${id}/process`),
};

export const budgetApi = {
  getBudgetPeriod: (month: number, year: number) => 
    api.get<{ budget_data: BudgetData; summary: BudgetSummary }>(`/budget/${month}/${year}`),
  
  getBalances: () => 
    api.get<{ balances: Balances; treasury: Treasury }>('/budget/balances/'),
  
  getChartData: (month: number, year: number) => 
    api.get(`/budget/charts/${month}/${year}`),
};

export default api;