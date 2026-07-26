'use server';

import { backendFetch } from '@/lib/api/backendFetch';
import { CategorySummaryResponse, CurrencySummaryResponse, MonthlyBalanceSummaryResponse } from '@/types/dto';
import { AmountPerCurrencyDto } from '@/types/dto/amountPerCurrencyDto';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). These are all
// read-only summary endpoints with no dedicated mutation here, but any action elsewhere that
// mutates transactions/accounts/categories MUST call revalidatePath for the pages that render
// these summaries, or reads will keep serving stale data for up to an hour.

const SUMMARY_PATH = '/summary';

export const getMonthSummary = async (year?: number, month?: number): Promise<CurrencySummaryResponse[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await backendFetch(`${SUMMARY_PATH}${queryString}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getYearSummary = async (year: number): Promise<CurrencySummaryResponse[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/${year}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getHistorySummary = async (): Promise<CurrencySummaryResponse[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/historic`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getTotalsByCurrency = async (year?: number, month?: number): Promise<CurrencySummaryResponse[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await backendFetch(`${SUMMARY_PATH}/totals-by-currency${queryString}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getTotalsByCategory = async (year?: number, month?: number): Promise<CategorySummaryResponse[]> => {
  const segments = [year, month].filter((value): value is number => value !== undefined);
  const filter = segments.length > 0 ? `/${segments.join('/')}` : '';
  const response = await backendFetch(`${SUMMARY_PATH}/totals-by-category${filter}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getYearlyTotalsByCategory = async (year: number): Promise<CategorySummaryResponse[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/totals-by-category/${year}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyTotalsByCategory = async (year: number, month: number): Promise<CategorySummaryResponse[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/totals-by-category/${year}/${month}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyExpenses = async (year: number, month: number): Promise<AmountPerCurrencyDto[]> => {
  // Fix: this used to call the /incomes endpoint (a copy-paste of getMonthlyIncomes below).
  // The backend's real expenses route is /summary/expenses/{year}/{month}/totals-by-currency
  // (see expensapp-api SummaryController#getExpensesTotalsByYearAndMonth).
  const response = await backendFetch(`${SUMMARY_PATH}/expenses/${year}/${month}/totals-by-currency`, {
    revalidate: 3600,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyHistory = async (months = 6): Promise<MonthlyBalanceSummaryResponse[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/monthly-history/${months}`, { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch Monthly history');
  }
  return await response.json();
};

export const getMonthlyIncomes = async (year: number, month: number): Promise<AmountPerCurrencyDto[]> => {
  const response = await backendFetch(`${SUMMARY_PATH}/incomes/${year}/${month}/totals-by-currency`, {
    revalidate: 3600,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};
