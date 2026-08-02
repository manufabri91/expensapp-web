import { render, screen } from '@testing-library/react';
import type { useTranslations } from 'next-intl';
import { CurrencySummaryCardView } from '@/components/CurrencySummaryCard/CurrencySummaryCardView';
import { CurrencySummaryResponse } from '@/types/dto';

const t = ((key: string) => key) as unknown as ReturnType<typeof useTranslations>;

const currencySummary: CurrencySummaryResponse = {
  currency: 'USD',
  totalBalance: 60,
  incomes: 100,
  expenses: -40,
};

describe('CurrencySummaryCardView component', () => {
  it('shows the account-balance title and the income/expense trend chip by default', () => {
    const { container } = render(<CurrencySummaryCardView currencySummary={currencySummary} locale="en" t={t} />);

    expect(screen.getByText('Dashboard.summary.balance.current.title')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('shows the period-total title and hides the trend chip for the periodTotal variant', () => {
    const { container } = render(
      <CurrencySummaryCardView currencySummary={currencySummary} locale="en" t={t} variant="periodTotal" />
    );

    expect(screen.getByText('Transactions.summary.total.title')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard.summary.balance.current.title')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
