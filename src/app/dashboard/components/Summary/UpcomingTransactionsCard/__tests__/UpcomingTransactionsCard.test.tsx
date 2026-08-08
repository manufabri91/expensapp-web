import { render, screen } from '@testing-library/react';
import React from 'react';
import { UpcomingTransactionsCard } from '@/app/dashboard/components/Summary/UpcomingTransactionsCard';
import { buildUpcomingTransactionItem } from '@/utils/testFixtures/buildUpcomingTransactionItem';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}::${JSON.stringify(values)}` : key,
  useLocale: () => 'en',
  useFormatter: () => ({ dateTime: (date: Date) => date.toISOString().slice(0, 10) }),
}));

describe('UpcomingTransactionsCard', () => {
  it('shows the title and signed total in the header', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem()]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText('Upcoming Expenses')).toBeInTheDocument();
  });

  it('renders one row per item with its description', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem({ description: 'Spotify' })]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('shows "due today" for an item whose date is today', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem({ date: new Date().toISOString() })]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText('dueToday')).toBeInTheDocument();
  });

  it('shows the formatted due date for an item due later in the month', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem({ date: futureDate.toISOString() })]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText(/dueOn::/)).toBeInTheDocument();
  });

  it('falls back to "ended" rather than a due date if an item ever arrives without one', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem({ date: null })]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.queryByText(/dueOn::/)).not.toBeInTheDocument();
  });

  it('shows the schedule description for a RECURRING item', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            intervalDays: 45,
          }),
        ]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText(/schedule\.everyNDays::/)).toBeInTheDocument();
  });

  it('does not show a schedule description for a ONE_TIME item', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[
          buildUpcomingTransactionItem({
            sourceType: 'ONE_TIME',
            frequency: null,
            intervalDays: null,
            daysOfMonth: null,
          }),
        ]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.queryByText(/schedule\./)).not.toBeInTheDocument();
  });

  it('renders without React key warnings when a RECURRING and a ONE_TIME item share a numeric id', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[
          buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 5, description: 'Recurring rent' }),
          buildUpcomingTransactionItem({
            sourceType: 'ONE_TIME',
            sourceId: 5,
            description: 'One-off purchase',
            frequency: null,
            intervalDays: null,
            daysOfMonth: null,
          }),
        ]}
        footerHref="/transactions#programmed-payments"
      />
    );

    expect(screen.getByText('Recurring rent')).toBeInTheDocument();
    expect(screen.getByText('One-off purchase')).toBeInTheDocument();
    const keyWarning = consoleErrorSpy.mock.calls.find((call) => String(call[0]).includes('unique "key" prop'));
    expect(keyWarning).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });

  it('links the footer to the href passed in via props', () => {
    render(
      <UpcomingTransactionsCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[buildUpcomingTransactionItem()]}
        footerHref="/transactions#programmed-incomes"
      />
    );

    expect(screen.getByRole('link', { name: /goToScheduledPayments/ })).toHaveAttribute(
      'href',
      '/transactions#programmed-incomes'
    );
  });
});
