import { headers as nextHeaders } from 'next/headers';

import { getBaseUrl } from '@/lib/utils/url';
import { CategorySummaryResponse, CurrencySummaryResponse } from '@/types/dto';
import { AmountPerCurrencyDto } from '@/types/dto/amountPerCurrencyDto';

const getSummaryBaseUrl = async () => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/api/summary`;
};

export const getMonthSummary = async (year?: number, month?: number): Promise<CurrencySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${baseUrl}${queryString}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getYearSummary = async (year: number): Promise<CurrencySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/${year}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getHistorySummary = async (): Promise<CurrencySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/historic`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getTotalsByCurrency = async (year?: number, month?: number): Promise<CurrencySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (month) params.append('month', month.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${baseUrl}/totals-by-currency${queryString}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getTotalsByCategory = async (year?: number, month?: number): Promise<CategorySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  let filter = '';
  if (year) filter += `/${year}/`;
  if (month) filter += `/${month}/`;
  const response = await fetch(`${baseUrl}/totals-by-category${filter}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getYearlyTotalsByCategory = async (year: number): Promise<CategorySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/totals-by-category/${year}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyTotalsByCategory = async (year: number, month: number): Promise<CategorySummaryResponse[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/totals-by-category/${year}/${month}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyExpenses = async (year: number, month: number): Promise<AmountPerCurrencyDto[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/incomes/${year}/${month}/totals-by-currency`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getMonthlyIncomes = async (year: number, month: number): Promise<AmountPerCurrencyDto[]> => {
  const baseUrl = await getSummaryBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/incomes/${year}/${month}/totals-by-currency`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};
