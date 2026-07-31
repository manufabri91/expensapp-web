import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import {
  CancelRecurringTransactionButton,
  DeleteRecurringTransactionButton,
  EditRecurringTransactionButton,
  PauseResumeRecurringTransactionButton,
} from '@/app/transactions/components/RecurringTransactionsSection/RecurringTransactionActions';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import {
  cancelRecurringTransaction,
  deleteRecurringTransactionById,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
} from '@/lib/actions/recurringTransactions';
import { RecurringTransactionResponse } from '@/types/dto';
import { Icon } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { TransactionType } from '@/types/enums/transactionType';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// The real `@/components` barrel re-exports every component in the app, including Navbar/LoginForm
// which pull in next-auth - a server-only dependency that doesn't belong in a jsdom test and drags
// in Node-runtime globals (Request/Response) jsdom doesn't provide. Import only what's actually used.
jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/components/TransactionForm/TransactionFormProvider', () => ({
  useTransactionForm: jest.fn(),
}));

jest.mock('@/lib/actions/recurringTransactions', () => ({
  pauseRecurringTransaction: jest.fn(),
  resumeRecurringTransaction: jest.fn(),
  cancelRecurringTransaction: jest.fn(),
  deleteRecurringTransactionById: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedUseTransactionForm = useTransactionForm as jest.Mock;
const mockedPause = pauseRecurringTransaction as jest.Mock;
const mockedResume = resumeRecurringTransaction as jest.Mock;
const mockedCancel = cancelRecurringTransaction as jest.Mock;
const mockedDelete = deleteRecurringTransactionById as jest.Mock;

const recurrence = (status: RecurrenceStatus): RecurringTransactionResponse => ({
  id: 1,
  type: TransactionType.EXPENSE,
  amount: 9.99,
  description: 'Streaming subscription',
  accountId: 1,
  accountName: 'Checking',
  category: { id: 1, name: 'Subscriptions', iconName: Icon.NONE, color: '#fff', type: TransactionType.EXPENSE, readOnly: false },
  subcategory: { id: 1, name: 'Streaming', parentCategoryId: 1, parentCategoryName: 'Subscriptions', readonly: false },
  frequency: RecurrenceFrequency.INTERVAL_DAYS,
  intervalDays: 30,
  daysOfMonth: [],
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: null,
  status,
  lastGeneratedDate: null,
  nextDueDate: null,
  excludeFromTotals: false,
});

describe('EditRecurringTransactionButton', () => {
  it('opens the recurring form for the given recurrence when pressed', () => {
    const showRecurringTransactionForm = jest.fn();
    mockedUseTransactionForm.mockReturnValue({ showRecurringTransactionForm });
    const activeRecurrence = recurrence(RecurrenceStatus.ACTIVE);

    render(<EditRecurringTransactionButton recurrence={activeRecurrence} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(showRecurringTransactionForm).toHaveBeenCalledWith(activeRecurrence);
  });
});

describe('PauseResumeRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedPause.mockReset();
    mockedResume.mockReset();
  });

  it('shows "pause" and calls pauseRecurringTransaction for an active recurrence', async () => {
    mockedPause.mockResolvedValue(undefined);
    const onChanged = jest.fn();

    render(<PauseResumeRecurringTransactionButton recurrence={recurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />);
    expect(screen.getByText('pause')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedPause).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });

  it('shows "resume" and calls resumeRecurringTransaction for a paused recurrence', async () => {
    mockedResume.mockResolvedValue(undefined);
    const onChanged = jest.fn();

    render(<PauseResumeRecurringTransactionButton recurrence={recurrence(RecurrenceStatus.PAUSED)} onChanged={onChanged} />);
    expect(screen.getByText('resume')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedResume).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });

  it('shows a danger toast and does not call onChanged when the action fails', async () => {
    mockedPause.mockRejectedValue(new Error('network down'));
    const onChanged = jest.fn();

    render(<PauseResumeRecurringTransactionButton recurrence={recurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(toast.danger).toHaveBeenCalledWith('network down'));
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe('CancelRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedCancel.mockReset();
  });

  it('does not cancel the recurrence until the confirmation dialog is accepted', async () => {
    const onChanged = jest.fn();
    render(<CancelRecurringTransactionButton recurrence={recurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockedCancel).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(mockedCancel).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });
});

describe('DeleteRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it('deletes the recurrence once the confirmation dialog is accepted', async () => {
    mockedDelete.mockResolvedValue({ success: true, message: 'deleted' });
    const onChanged = jest.fn();
    render(<DeleteRecurringTransactionButton recurrence={recurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });
});
