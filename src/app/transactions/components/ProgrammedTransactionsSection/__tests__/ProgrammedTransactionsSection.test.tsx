import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import useSWR from 'swr';
import { ProgrammedTransactionsSection } from '@/app/transactions/components/ProgrammedTransactionsSection';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { pauseRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { confirmTransaction, deleteTransactionById } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { ProgrammedTransactionsResponse, RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';
import { buildUpcomingTransactionItem } from '@/utils/testFixtures/buildUpcomingTransactionItem';

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
// only what ProgrammedTransactionsSection and its children actually use.
jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
  Icon: jest.requireActual('@/components/Icon').Icon,
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
jest.mock('@/lib/actions/summaries', () => ({ getProgrammedTransactions: jest.fn() }));
jest.mock('@/lib/actions/transactions', () => ({
  confirmTransaction: jest.fn(),
  deleteTransactionById: jest.fn(),
}));

const PROGRAMMED_TRANSACTIONS_CACHE_KEY = '/api/summary/programmed-transactions';
const NO_PROGRAMMED_TRANSACTIONS: ProgrammedTransactionsResponse = { expenses: [], incomes: [] };

const mockedUseSWR = useSWR as jest.Mock;
const mockedUseAccounts = useAccounts as jest.Mock;
const mockedUseTransactionForm = useTransactionForm as jest.Mock;

const mutateProgrammedTransactions = jest.fn();
const mutateRecurrences = jest.fn();

interface SwrStateOverrides {
  programmedTransactions?: ProgrammedTransactionsResponse;
  isLoadingProgrammedTransactions?: boolean;
  recurrences?: RecurringTransactionResponse[];
}

const givenLists = ({
  programmedTransactions = NO_PROGRAMMED_TRANSACTIONS,
  isLoadingProgrammedTransactions = false,
  recurrences = [],
}: SwrStateOverrides = {}) => {
  mockedUseSWR.mockImplementation((cacheKey: string) =>
    cacheKey === PROGRAMMED_TRANSACTIONS_CACHE_KEY
      ? {
          data: programmedTransactions,
          isLoading: isLoadingProgrammedTransactions,
          mutate: mutateProgrammedTransactions,
        }
      : { data: recurrences, isLoading: false, mutate: mutateRecurrences }
  );
};

const buildOneTimeItem = (overrides: Parameters<typeof buildUpcomingTransactionItem>[0] = {}) =>
  buildUpcomingTransactionItem({
    sourceType: 'ONE_TIME',
    frequency: null,
    intervalDays: null,
    daysOfMonth: null,
    ...overrides,
  });

const textContentOf = (anchorId: string) => document.getElementById(anchorId)?.textContent ?? '';

describe('ProgrammedTransactionsSection', () => {
  beforeEach(() => {
    mockedUseAccounts.mockReturnValue({
      accounts: [{ id: 1, name: 'Checking', currency: 'USD', accountBalance: 0, initialBalance: 0 }],
    });
    mockedUseTransactionForm.mockReturnValue({ showRecurringTransactionForm: jest.fn() });
  });

  it('renders a payments card and an incomes card', () => {
    givenLists();

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('title.payments')).toBeInTheDocument();
    expect(screen.getByText('title.incomes')).toBeInTheDocument();
    expect(document.getElementById('programmed-payments')).toBeInTheDocument();
    expect(document.getElementById('programmed-incomes')).toBeInTheDocument();
  });

  it('shows a spinner in both cards while the programmed list is loading', () => {
    givenLists({ isLoadingProgrammedTransactions: true });

    render(<ProgrammedTransactionsSection />);

    expect(document.querySelectorAll('[class*="spinner"]').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('noProgrammed')).not.toBeInTheDocument();
  });

  it('shows the empty state in both cards when there is nothing programmed', () => {
    givenLists();

    render(<ProgrammedTransactionsSection />);

    expect(screen.getAllByText('noProgrammed')).toHaveLength(2);
  });

  it('renders expenses in the payments card and incomes in the incomes card', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildOneTimeItem({ sourceId: 10, description: 'Annual insurance' })],
        incomes: [buildOneTimeItem({ sourceId: 20, description: 'Freelance invoice', signedAmount: 500 })],
      },
    });

    render(<ProgrammedTransactionsSection />);

    expect(textContentOf('programmed-payments')).toContain('Annual insurance');
    expect(textContentOf('programmed-incomes')).toContain('Freelance invoice');
  });

  it('shows all four original actions for an active recurring item', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 1, status: RecurrenceStatus.ACTIVE })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText('pause')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('hides Pause/Resume and Cancel for a cancelled recurring item, but still allows Edit and Delete', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 1, status: RecurrenceStatus.CANCELLED })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.queryByText('pause')).not.toBeInTheDocument();
    expect(screen.queryByText('cancel')).not.toBeInTheDocument();
    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('revalidates both lists once a recurring action (e.g. pause) completes', async () => {
    (pauseRecurringTransaction as jest.Mock).mockResolvedValue(undefined);
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 1, status: RecurrenceStatus.ACTIVE })],
    });

    render(<ProgrammedTransactionsSection />);
    fireEvent.click(screen.getByText('pause'));

    await waitFor(() => expect(pauseRecurringTransaction).toHaveBeenCalledWith(1));
    expect(mutateProgrammedTransactions).toHaveBeenCalled();
    expect(mutateRecurrences).toHaveBeenCalled();
  });

  it('renders a recurring row without action buttons when its recurrence has not been fetched yet', () => {
    givenLists({
      programmedTransactions: {
        expenses: [
          buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 99, description: 'Orphan recurrence' }),
        ],
        incomes: [],
      },
      recurrences: [],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('Orphan recurrence')).toBeInTheDocument();
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
    expect(screen.queryByText('delete')).not.toBeInTheDocument();
    expect(screen.queryByText('confirm')).not.toBeInTheDocument();
    expect(screen.queryByText('remove')).not.toBeInTheDocument();
  });

  it('shows Confirm and Remove actions for a one-time pending item', () => {
    givenLists({
      programmedTransactions: { expenses: [buildOneTimeItem({ sourceId: 55 })], incomes: [] },
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('remove')).toBeInTheDocument();
    expect(screen.queryByText('edit')).not.toBeInTheDocument();
    expect(screen.queryByText('pause')).not.toBeInTheDocument();
  });

  it('confirms a one-time pending item by its source id and revalidates', async () => {
    (confirmTransaction as jest.Mock).mockResolvedValue({ id: 55 });
    givenLists({
      programmedTransactions: { expenses: [buildOneTimeItem({ sourceId: 55 })], incomes: [] },
    });

    render(<ProgrammedTransactionsSection />);
    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => expect(confirmTransaction).toHaveBeenCalledWith(55));
    expect(mutateProgrammedTransactions).toHaveBeenCalled();
  });

  it('removes a one-time pending item by its source id once the dialog is confirmed', async () => {
    (deleteTransactionById as jest.Mock).mockResolvedValue({ success: true, message: 'deleted' });
    givenLists({
      programmedTransactions: { expenses: [buildOneTimeItem({ sourceId: 55 })], incomes: [] },
    });

    render(<ProgrammedTransactionsSection />);
    fireEvent.click(screen.getByText('remove'));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(deleteTransactionById).toHaveBeenCalledWith(55));
    expect(mutateProgrammedTransactions).toHaveBeenCalled();
  });

  it('interleaves recurring and one-time items sorted by date ascending within a card', () => {
    givenLists({
      programmedTransactions: {
        expenses: [
          buildOneTimeItem({ sourceId: 30, date: '2024-06-30T00:00:00.000Z', description: 'Late one-time' }),
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            sourceId: 1,
            date: '2024-06-10T00:00:00.000Z',
            description: 'Mid recurring',
          }),
          buildOneTimeItem({ sourceId: 10, date: '2024-06-01T00:00:00.000Z', description: 'Early one-time' }),
        ],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 1, description: 'Mid recurring' })],
    });

    render(<ProgrammedTransactionsSection />);

    const renderedText = textContentOf('programmed-payments');
    expect(renderedText.indexOf('Early one-time')).toBeGreaterThanOrEqual(0);
    expect(renderedText.indexOf('Early one-time')).toBeLessThan(renderedText.indexOf('Mid recurring'));
    expect(renderedText.indexOf('Mid recurring')).toBeLessThan(renderedText.indexOf('Late one-time'));
  });

  it('shows "due today" and "no end date" for a recurring item due today with an open-ended schedule', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 1, nextDueDate: new Date().toISOString(), endDate: null })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('dueToday')).toBeInTheDocument();
    expect(screen.getByText('noEndDate')).toBeInTheDocument();
  });

  it('shows the formatted due date and end date for a recurring item due later', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      recurrences: [
        buildRecurrence({ id: 1, nextDueDate: '2024-02-01T00:00:00.000Z', endDate: '2024-12-31T00:00:00.000Z' }),
      ],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText(/dueOn/)).toBeInTheDocument();
    expect(screen.getByText(/endsOn/)).toBeInTheDocument();
  });

  it('shows "ended" for a recurring item that has no next due date left', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 1 })],
        incomes: [],
      },
      // nextDueDate is null once a recurrence's endDate has already passed - it stays visible
      // here (only CANCELLED/deleted recurrences are hidden), so this must not crash.
      recurrences: [buildRecurrence({ id: 1, nextDueDate: null, endDate: '2024-01-31T00:00:00.000Z' })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('ended')).toBeInTheDocument();
  });

  it('shows "due today" for a one-time pending item dated today', () => {
    givenLists({
      programmedTransactions: {
        expenses: [buildOneTimeItem({ sourceId: 55, date: new Date().toISOString() })],
        incomes: [],
      },
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('dueToday')).toBeInTheDocument();
  });

  it('sorts ended recurring items (null date) last, after everything still scheduled', () => {
    givenLists({
      programmedTransactions: {
        expenses: [
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            sourceId: 2,
            date: null,
            description: 'Ended recurrence',
          }),
          buildOneTimeItem({ sourceId: 30, date: '2024-06-30T00:00:00.000Z', description: 'Late one-time' }),
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            sourceId: 3,
            date: null,
            description: 'Another ended recurrence',
          }),
          buildOneTimeItem({ sourceId: 10, date: '2024-06-01T00:00:00.000Z', description: 'Early one-time' }),
        ],
        incomes: [],
      },
      recurrences: [
        buildRecurrence({ id: 2, description: 'Ended recurrence', nextDueDate: null }),
        buildRecurrence({ id: 3, description: 'Another ended recurrence', nextDueDate: null }),
      ],
    });

    render(<ProgrammedTransactionsSection />);

    const renderedText = textContentOf('programmed-payments');
    expect(renderedText.indexOf('Early one-time')).toBeLessThan(renderedText.indexOf('Late one-time'));
    expect(renderedText.indexOf('Late one-time')).toBeLessThan(renderedText.indexOf('Ended recurrence'));
    expect(renderedText.indexOf('Late one-time')).toBeLessThan(renderedText.indexOf('Another ended recurrence'));
  });

  it('still offers Edit and Delete on an ended recurring item so it can be cleaned up', () => {
    givenLists({
      programmedTransactions: {
        expenses: [
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            sourceId: 2,
            date: null,
            description: 'Ended recurrence',
          }),
        ],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 2, nextDueDate: null, endDate: '2024-01-31T00:00:00.000Z' })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.getByText('edit')).toBeInTheDocument();
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('shows "ended" instead of a due date for a null-dated recurring item with no matching recurrence', () => {
    givenLists({
      programmedTransactions: {
        expenses: [
          buildUpcomingTransactionItem({
            sourceType: 'RECURRING',
            sourceId: 99,
            date: null,
            description: 'Orphan ended recurrence',
          }),
        ],
        incomes: [],
      },
      recurrences: [],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('Orphan ended recurrence')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.queryByText('dueToday')).not.toBeInTheDocument();
    expect(screen.queryByText(/dueOn/)).not.toBeInTheDocument();
  });

  it('renders a recurring and a one-time item that share a numeric id without React key warnings', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    givenLists({
      programmedTransactions: {
        expenses: [
          buildUpcomingTransactionItem({ sourceType: 'RECURRING', sourceId: 5, description: 'Recurring rent' }),
          buildOneTimeItem({ sourceId: 5, description: 'One-off purchase' }),
        ],
        incomes: [],
      },
      recurrences: [buildRecurrence({ id: 5, description: 'Recurring rent' })],
    });

    render(<ProgrammedTransactionsSection />);

    expect(screen.getByText('Recurring rent')).toBeInTheDocument();
    expect(screen.getByText('One-off purchase')).toBeInTheDocument();
    const keyWarning = consoleErrorSpy.mock.calls.find((call) => String(call[0]).includes('unique "key" prop'));
    expect(keyWarning).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });
});
