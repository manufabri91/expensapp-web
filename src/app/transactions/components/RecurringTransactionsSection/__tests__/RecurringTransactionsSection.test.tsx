import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import useSWR from 'swr';
import { RecurringTransactionsSection } from '@/app/transactions/components/RecurringTransactionsSection';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { deleteRecurringTransactionById, pauseRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useFormatter: () => ({ dateTime: (date: Date) => date.toISOString() }),
}));

// TypeBadge imports useTranslations from 'use-intl' directly (next-intl's own re-export), which
// needs the same mock since it also requires a real IntlProvider context otherwise.
jest.mock('use-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// The real `@/components` barrel re-exports every component in the app, including Navbar/LoginForm
// which pull in next-auth - a server-only dependency that doesn't belong in a jsdom test. Import
// only what RecurringTransactionsSection and its children actually use.
jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
  Money: jest.requireActual('@/components/Money').Money,
  TypeBadge: jest.requireActual('@/components/TypeBadge').TypeBadge,
}));

jest.mock('swr');
jest.mock('@/lib/providers/AccountsProvider', () => ({ useAccounts: jest.fn() }));
jest.mock('@/components/TransactionForm/TransactionFormProvider', () => ({ useTransactionForm: jest.fn() }));
jest.mock('@/lib/actions/recurringTransactions', () => ({
  getRecurringTransactions: jest.fn(),
  pauseRecurringTransaction: jest.fn(),
  resumeRecurringTransaction: jest.fn(),
  cancelRecurringTransaction: jest.fn(),
  deleteRecurringTransactionById: jest.fn(),
}));

const mockedUseSWR = useSWR as jest.Mock;
const mockedUseAccounts = useAccounts as jest.Mock;
const mockedUseTransactionForm = useTransactionForm as jest.Mock;

describe('RecurringTransactionsSection', () => {
  beforeEach(() => {
    mockedUseAccounts.mockReturnValue({ accounts: [{ id: 1, name: 'Checking', currency: 'USD', accountBalance: 0, initialBalance: 0 }] });
    mockedUseTransactionForm.mockReturnValue({ showRecurringTransactionForm: jest.fn() });
  });

  it('shows a spinner while the list is loading', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, isLoading: true, mutate: jest.fn() });

    render(<RecurringTransactionsSection />);

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(document.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it('shows the empty state when there are no recurring transactions', () => {
    mockedUseSWR.mockReturnValue({ data: [], isLoading: false, mutate: jest.fn() });

    render(<RecurringTransactionsSection />);

    expect(screen.getByText('noRecurring')).toBeInTheDocument();
  });

  it('renders one accordion item per recurrence with its description, amount, and status', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildRecurrence({ id: 1, description: 'Streaming subscription' }), buildRecurrence({ id: 2, description: 'Gym membership' })],
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<RecurringTransactionsSection />);

    expect(screen.getByText('Streaming subscription')).toBeInTheDocument();
    expect(screen.getByText('Gym membership')).toBeInTheDocument();
    expect(screen.getAllByText('status.ACTIVE')).toHaveLength(2);
  });

  it('hides Pause/Resume and Cancel actions for a cancelled recurrence, but still allows delete', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildRecurrence({ status: RecurrenceStatus.CANCELLED })],
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<RecurringTransactionsSection />);

    expect(screen.queryByText('pause')).not.toBeInTheDocument();
    expect(screen.queryByText('cancel')).not.toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('shows Pause and Cancel actions for an active recurrence', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildRecurrence({ status: RecurrenceStatus.ACTIVE })],
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<RecurringTransactionsSection />);

    expect(screen.getByText('pause')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('revalidates the list once an action (e.g. pause) completes', async () => {
    (pauseRecurringTransaction as jest.Mock).mockResolvedValue(undefined);
    const mutate = jest.fn();
    mockedUseSWR.mockReturnValue({ data: [buildRecurrence({ status: RecurrenceStatus.ACTIVE })], isLoading: false, mutate });

    render(<RecurringTransactionsSection />);
    fireEvent.click(screen.getByText('pause'));

    await waitFor(() => expect(pauseRecurringTransaction).toHaveBeenCalledWith(1));
    expect(mutate).toHaveBeenCalled();
  });

  it('revalidates the list once a delete is confirmed', async () => {
    (deleteRecurringTransactionById as jest.Mock).mockResolvedValue({ success: true, message: 'deleted' });
    const mutate = jest.fn();
    mockedUseSWR.mockReturnValue({ data: [buildRecurrence({ status: RecurrenceStatus.ACTIVE })], isLoading: false, mutate });

    render(<RecurringTransactionsSection />);
    fireEvent.click(screen.getByText('delete'));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(deleteRecurringTransactionById).toHaveBeenCalledWith(1));
    expect(mutate).toHaveBeenCalled();
  });

  it('shows the next occurrence date when present, and a "no end date" label when there is none', () => {
    mockedUseSWR.mockReturnValue({
      data: [buildRecurrence({ nextDueDate: '2024-02-01T00:00:00.000Z', endDate: null })],
      isLoading: false,
      mutate: jest.fn(),
    });

    render(<RecurringTransactionsSection />);

    expect(screen.getByText(/nextOccurrence/)).toBeInTheDocument();
    expect(screen.getByText('noEndDate')).toBeInTheDocument();
  });
});
