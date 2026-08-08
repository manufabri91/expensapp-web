import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { createTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}${JSON.stringify(values)}` : key,
  useLocale: () => 'en',
}));
jest.mock('use-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/components/TransactionForm/TransactionFormProvider', () => ({ useTransactionForm: jest.fn() }));
jest.mock('@/lib/providers/AccountsProvider', () => ({ useAccounts: jest.fn() }));
jest.mock('@/lib/providers/CategoriesProvider', () => ({ useCategories: jest.fn() }));
jest.mock('@/hooks/useTrySystemTranslations', () => ({ useTrySystemTranslations: () => (name: string) => name }));
jest.mock('@/lib/actions/transactions', () => ({ createTransaction: jest.fn(), editTransaction: jest.fn() }));
jest.mock('@/lib/actions/recurringTransactions', () => ({
  createRecurringTransaction: jest.fn(),
  editRecurringTransaction: jest.fn(),
}));
jest.mock('@/components/TransactionsTable/useInfiniteTransactions', () => ({
  getRecentTransactionsCacheKey: () => 'recent-transactions-key',
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedUseTransactionForm = useTransactionForm as jest.Mock;
const mockedUseAccounts = useAccounts as jest.Mock;
const mockedUseCategories = useCategories as jest.Mock;
const mockedCreateTransaction = createTransaction as jest.Mock;

const openOverlay = { isOpen: true, setOpen: jest.fn(), open: jest.fn(), close: jest.fn() };

describe('TransactionForm - recurring mode wiring', () => {
  beforeEach(() => {
    mockedUseAccounts.mockReturnValue({
      accounts: [{ id: 1, name: 'Checking', currency: 'USD', accountBalance: 0, initialBalance: 0 }],
    });
    mockedUseCategories.mockReturnValue({ categories: [], subcategories: [] });
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });
  });

  it('defaults to one-time mode: shows the single event-date field and hides recurrence fields', () => {
    render(<TransactionForm />);

    expect(screen.getByText('Generics.date')).toBeInTheDocument();
    expect(screen.queryByText('TransactionForm.startDate')).not.toBeInTheDocument();
    expect(screen.queryByText('TransactionForm.frequency.intervalDays')).not.toBeInTheDocument();
  });

  it('switching to recurring mode swaps the event-date field for start date and frequency controls', () => {
    render(<TransactionForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'recurring' }));

    expect(screen.queryByText('Generics.date')).not.toBeInTheDocument();
    expect(screen.getByText('TransactionForm.startDate')).toBeInTheDocument();
    expect(screen.getByText('TransactionForm.frequency.intervalDays')).toBeInTheDocument();
    expect(screen.getByText('TransactionForm.frequency.monthlyDays')).toBeInTheDocument();
  });

  it('hides the Transfer option from the type selector once recurring mode is selected', () => {
    render(<TransactionForm />);

    expect(screen.getByRole('radio', { name: 'transfer.singular' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'recurring' }));

    expect(screen.queryByRole('radio', { name: 'transfer.singular' })).not.toBeInTheDocument();
  });

  it('does not render the mode selector at all when editing an existing one-time transaction', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: {
        id: 1,
        eventDate: '2024-01-01T00:00:00.000Z',
        description: 'Groceries',
        amount: -45.5,
        type: 'EXPENSE',
        currencyCode: 'USD',
        accountId: 1,
        accountName: 'Checking',
        category: { id: 1, name: 'Food', iconName: 'icon', color: '#fff', type: 'EXPENSE', readOnly: false },
        subcategory: { id: 1, name: 'Groceries', parentCategoryId: 1, parentCategoryName: 'Food', readOnly: false },
        excludeFromTotals: false,
        linkedTransaction: null,
      },
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    expect(screen.queryByRole('radio', { name: 'oneTime' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'recurring' })).not.toBeInTheDocument();
  });
});

describe('TransactionForm - excludeFromTotals switch (pending-transaction default)', () => {
  beforeEach(() => {
    mockedUseAccounts.mockReturnValue({
      accounts: [{ id: 1, name: 'Checking', currency: 'USD', accountBalance: 0, initialBalance: 0 }],
    });
    mockedUseCategories.mockReturnValue({ categories: [], subcategories: [] });
  });

  const getExcludeFromTotalsSwitch = () =>
    screen.getByRole('switch', { name: 'TransactionForm.excludeFromTotals' }) as HTMLInputElement;

  const getEventDateYearSegment = () => screen.getByRole('spinbutton', { name: /year/i });

  const moveEventDateYearBy = (steps: number) => {
    const yearSegment = getEventDateYearSegment();
    const key = steps >= 0 ? 'ArrowUp' : 'ArrowDown';
    for (let i = 0; i < Math.abs(steps); i += 1) {
      fireEvent.keyDown(yearSegment, { key });
    }
  };

  it('auto-enables the switch when the user picks a future event date', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    expect(getExcludeFromTotalsSwitch().checked).toBe(false);

    moveEventDateYearBy(3);

    expect(getExcludeFromTotalsSwitch().checked).toBe(true);
  });

  it('auto-disables the switch when the date is moved back to the past, as long as it was never manually touched', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    moveEventDateYearBy(3);
    expect(getExcludeFromTotalsSwitch().checked).toBe(true);

    moveEventDateYearBy(-5);
    expect(getExcludeFromTotalsSwitch().checked).toBe(false);
  });

  it('stops auto-overriding the switch once the user manually toggles it, even after the date changes again', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    moveEventDateYearBy(3);
    expect(getExcludeFromTotalsSwitch().checked).toBe(true);

    fireEvent.click(getExcludeFromTotalsSwitch());
    expect(getExcludeFromTotalsSwitch().checked).toBe(false);

    moveEventDateYearBy(1);
    expect(getExcludeFromTotalsSwitch().checked).toBe(false);

    moveEventDateYearBy(-4);
    expect(getExcludeFromTotalsSwitch().checked).toBe(false);
  });

  it('seeds the switch from the saved value when editing an existing one-time transaction with a future date, without auto-overriding it', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: {
        id: 1,
        eventDate: '2099-01-01T00:00:00.000Z',
        description: 'Rent',
        amount: -1200,
        type: 'EXPENSE',
        currencyCode: 'USD',
        accountId: 1,
        accountName: 'Checking',
        category: { id: 1, name: 'Housing', iconName: 'icon', color: '#fff', type: 'EXPENSE', readOnly: false },
        subcategory: { id: 1, name: 'Rent', parentCategoryId: 1, parentCategoryName: 'Housing', readOnly: false },
        excludeFromTotals: false,
        linkedTransaction: null,
      },
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    expect(getExcludeFromTotalsSwitch().checked).toBe(false);
  });

  it('leaves the switch unaffected by the date-driven effect while in recurring mode', () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });

    render(<TransactionForm />);

    fireEvent.click(screen.getByRole('radio', { name: 'recurring' }));

    expect(getExcludeFromTotalsSwitch().checked).toBe(false);

    const startDateYearSegment = screen.getByRole('spinbutton', { name: /year/i });
    fireEvent.keyDown(startDateYearSegment, { key: 'ArrowUp' });
    fireEvent.keyDown(startDateYearSegment, { key: 'ArrowUp' });
    fireEvent.keyDown(startDateYearSegment, { key: 'ArrowUp' });

    expect(getExcludeFromTotalsSwitch().checked).toBe(false);
  });

  it('still carries excludeFromTotals through native FormData submission now that the switch is controlled', async () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });
    mockedCreateTransaction.mockResolvedValue(undefined);

    render(<TransactionForm />);

    // The Modal renders its content through a portal, so the <form> lives outside the render container.
    const form = document.querySelector('form') as HTMLFormElement;

    fireEvent.click(getExcludeFromTotalsSwitch());
    expect(getExcludeFromTotalsSwitch().checked).toBe(true);

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockedCreateTransaction).toHaveBeenCalledTimes(1);
    const submittedFormData = mockedCreateTransaction.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('excludeFromTotals')).toBe('on');
  });

  it('omits excludeFromTotals from the submitted FormData when the switch is left unchecked', async () => {
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
      clearForm: jest.fn(),
    });
    mockedCreateTransaction.mockResolvedValue(undefined);

    render(<TransactionForm />);

    const form = document.querySelector('form') as HTMLFormElement;

    expect(getExcludeFromTotalsSwitch().checked).toBe(false);

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockedCreateTransaction).toHaveBeenCalledTimes(1);
    const submittedFormData = mockedCreateTransaction.mock.calls[0][0] as FormData;
    expect(submittedFormData.get('excludeFromTotals')).toBeNull();
  });
});
