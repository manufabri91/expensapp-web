import { render, screen } from '@testing-library/react';
import React from 'react';
import { UpcomingRecurringCard } from '@/app/dashboard/components/Summary/UpcomingRecurringCard';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}::${JSON.stringify(values)}` : key,
  useLocale: () => 'en',
  useFormatter: () => ({ dateTime: (date: Date) => date.toISOString().slice(0, 10) }),
}));

describe('UpcomingRecurringCard', () => {
  it('shows the title and signed total in the header', () => {
    render(
      <UpcomingRecurringCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[{ recurrence: buildRecurrence({ nextDueDate: new Date().toISOString() }), signedAmount: -16.99 }]}
      />
    );

    expect(screen.getByText('Upcoming Expenses')).toBeInTheDocument();
  });

  it('renders one row per item with its description and schedule', () => {
    render(
      <UpcomingRecurringCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[
          { recurrence: buildRecurrence({ description: 'Spotify', nextDueDate: new Date().toISOString() }), signedAmount: -16.99 },
        ]}
      />
    );

    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('shows "due today" for a recurrence whose next due date is today', () => {
    render(
      <UpcomingRecurringCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[{ recurrence: buildRecurrence({ nextDueDate: new Date().toISOString() }), signedAmount: -16.99 }]}
      />
    );

    expect(screen.getByText('dueToday')).toBeInTheDocument();
  });

  it('shows the formatted due date for a recurrence due later in the month', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    render(
      <UpcomingRecurringCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[{ recurrence: buildRecurrence({ nextDueDate: futureDate.toISOString() }), signedAmount: -16.99 }]}
      />
    );

    expect(screen.getByText(/dueOn::/)).toBeInTheDocument();
  });

  it('links to the recurring transactions section', () => {
    render(
      <UpcomingRecurringCard
        title="Upcoming Expenses"
        currency="EUR"
        total={-16.99}
        items={[{ recurrence: buildRecurrence({ nextDueDate: new Date().toISOString() }), signedAmount: -16.99 }]}
      />
    );

    expect(screen.getByRole('link', { name: /goToScheduledPayments/ })).toHaveAttribute(
      'href',
      '/transactions#recurring-transactions'
    );
  });
});
