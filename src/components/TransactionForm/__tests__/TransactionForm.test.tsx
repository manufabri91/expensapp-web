import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { editRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { TransactionResponse } from '@/types/dto';
import { Icon } from '@/types/enums/icon';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';
import messages from '../../../../messages/en.json';

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

const account = { id: 1, name: 'Personal', currency: 'USD', accountBalance: 0, initialBalance: 0 };
const category = {
  id: 1,
  name: 'Food',
  type: TransactionType.EXPENSE,
  iconName: Icon.CART,
  color: '#fff',
  readOnly: false,
};
const subcategory = { id: 1, name: 'Groceries', parentCategoryId: 1, parentCategoryName: 'Food', readonly: false };
const transaction: TransactionResponse = {
  id: 1,
  eventDate: '2025-01-01T00:00:00.000Z',
  description: 'Groceries',
  amount: -42.5,
  type: TransactionType.EXPENSE,
  currencyCode: 'USD',
  accountId: 1,
  accountName: 'Personal',
  category,
  subcategory,
  excludeFromTotals: false,
  linkedTransaction: null,
};
const renderForm = () =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TransactionForm />
    </NextIntlClientProvider>
  );
const press = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const continueWithAmount = () => {
  press('4');
  press('2');
  press('Continue →');
};
const editExisting = (override = {}) =>
  mockedUseTransactionForm.mockReturnValue({
    overlayState: openOverlay,
    clearForm: jest.fn(),
    transactionFormData: { ...transaction, ...override },
    recurringFormData: undefined,
    formMode: 'oneTime',
  });

describe('amount-first transaction entry', () => {
  beforeEach(() => {
    mockedUseAccounts.mockReturnValue({
      accounts: [account, { ...account, id: 2, name: 'Savings' }, { ...account, id: 3, name: 'Euro', currency: 'EUR' }],
    });
    mockedUseCategories.mockReturnValue({
      categories: [category, { ...category, id: 2, name: 'Other' }],
      subcategories: [subcategory],
    });
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      clearForm: jest.fn(),
      openingAccountId: 1,
      transactionFormData: undefined,
      recurringFormData: undefined,
      formMode: 'oneTime',
    });
    mockedCreateTransaction.mockResolvedValue(transaction);
  });
  it('starts new entries at amount and only advances after valid input', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeDisabled();
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
    continueWithAmount();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.queryByText(messages.Validation.required)).not.toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(mockedCreateTransaction).not.toHaveBeenCalled();
  });
  it('evaluates arithmetic in entry order and preserves the draft on back navigation', () => {
    renderForm();
    press('2');
    press('Add');
    press('3');
    press('Multiply');
    press('4');
    press('Continue →');
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Lunch' } });
    press('Edit amount');
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('20.00');
    press('Continue →');
    expect(screen.getByLabelText('Description')).toHaveValue('Lunch');
  });
  it('supports keyboard input, clearing, and localized paste without opening a mobile keyboard', () => {
    renderForm();
    const input = screen.getByRole('textbox', { name: 'Amount' });
    expect(input).toHaveAttribute('inputmode', 'none');
    fireEvent.keyDown(input, { key: '7' });
    fireEvent.keyDown(input, { key: '+' });
    fireEvent.keyDown(input, { key: '3' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('10.00');
    fireEvent.keyDown(input, { key: 'Delete' });
    fireEvent.paste(input, { clipboardData: { getData: () => '1,234.50' } });
    expect(input).toHaveValue('1234.50');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
  it('shows calculation errors and permits correction', () => {
    renderForm();
    press('1');
    press('Divide');
    press('0');
    press('Equals');
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot divide by zero');
    press('Clear');
    press('5');
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeEnabled();
  });
  it('has no implicit first-account fallback', () => {
    mockedUseTransactionForm.mockReturnValue({ overlayState: openOverlay, clearForm: jest.fn(), formMode: 'oneTime' });
    renderForm();
    press('4');
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeDisabled();
    expect(screen.getByText('Select an account to continue.')).toBeInTheDocument();
  });
  it('offers account management when there are no accounts', () => {
    mockedUseAccounts.mockReturnValue({ accounts: [] });
    renderForm();
    expect(screen.getByRole('link', { name: 'Manage accounts' })).toHaveAttribute('href', '/manage');
  });
  it('requires description, category, and subcategory before creating an expense', async () => {
    renderForm();
    continueWithAmount();
    press('Save transaction');
    await waitFor(() => expect(screen.getAllByText(messages.Validation.required).length).toBeGreaterThan(0));
    expect(mockedCreateTransaction).not.toHaveBeenCalled();
  });
  it('opens edits in details and saves the existing numeric API shape', async () => {
    editExisting();
    jest.mocked(editTransaction).mockResolvedValue(transaction);
    renderForm();
    expect(screen.getByLabelText('Description')).toHaveValue('Groceries');
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '  Weekly food  ' } });
    press(messages.Generics.edit);
    await waitFor(() =>
      expect(editTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          amount: 42.5,
          description: 'Weekly food',
          accountId: 1,
          categoryId: 1,
          subcategoryId: 1,
        })
      )
    );
    expect(openOverlay.close).toHaveBeenCalled();
  });
  it('retains input and displays save failures', async () => {
    editExisting();
    jest.mocked(editTransaction).mockRejectedValueOnce(new Error('Save failed'));
    renderForm();
    press(messages.Generics.edit);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Save failed'));
    expect(screen.getByLabelText('Description')).toHaveValue('Groceries');
    expect(screen.getByRole('button', { name: messages.Generics.edit })).toBeEnabled();
  });
  it('confirms dismissal after changes and can keep editing or discard', async () => {
    renderForm();
    press('5');
    press('Close');
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Discard transaction?');
    press('Keep editing');
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('5');
    press('Close');
    press('Discard');
    expect(openOverlay.close).toHaveBeenCalled();
  });
  it('closes an untouched draft without asking to discard', () => {
    renderForm();
    press('Close');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(openOverlay.close).toHaveBeenCalled();
  });
  it('preserves the amount when switching to recurring and hides transfers', () => {
    renderForm();
    press('7');
    fireEvent.click(screen.getByRole('radio', { name: messages.TransactionForm.mode.recurring }));
    expect(screen.queryByRole('radio', { name: messages.Generics.transfer.singular })).not.toBeInTheDocument();
    press('Continue →');
    expect(screen.getByText(messages.TransactionForm.intervalDaysLabel)).toBeInTheDocument();
    expect(screen.queryByText(messages.Generics.date)).not.toBeInTheDocument();
  });
  it('preserves future-date totals exclusion and respects manual overrides', () => {
    editExisting({ eventDate: '2099-01-01T00:00:00.000Z', excludeFromTotals: true });
    renderForm();
    const toggle = screen.getByRole('switch', { name: messages.TransactionForm.excludeFromTotals });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });
  it('switches transfer to expense when recurring is chosen', () => {
    renderForm();
    fireEvent.click(screen.getByRole('radio', { name: messages.Generics.transfer.singular }));
    fireEvent.click(screen.getByRole('radio', { name: messages.TransactionForm.mode.recurring }));
    expect(screen.getByRole('radio', { name: messages.Generics.expense.singular })).toBeChecked();
  });
  it('clears category-dependent selection rather than choosing the first subcategory', async () => {
    editExisting();
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /Category/ }));
    const option = await screen.findByRole('option', { name: 'Other' });
    fireEvent.click(option);
    // A changed category requires an explicit new subcategory selection.
    expect(screen.getByText(messages.TransactionForm.selectSubcategory)).toBeInTheDocument();
  });
  it('hydrates a recurring edit, exposes monthly schedule controls, and saves it', async () => {
    const recurrence = buildRecurrence({
      category,
      subcategory,
      frequency: RecurrenceFrequency.MONTHLY_DAYS,
      daysOfMonth: [1, 15],
      endDate: '2099-12-31T00:00:00.000Z',
    });
    mockedUseTransactionForm.mockReturnValue({
      overlayState: openOverlay,
      clearForm: jest.fn(),
      formMode: 'recurring',
      recurringFormData: recurrence,
    });
    jest.mocked(editRecurringTransaction).mockResolvedValue(recurrence);
    renderForm();
    expect(screen.getByLabelText('Description')).toHaveValue(recurrence.description);
    expect(screen.getByRole('checkbox', { name: '15' })).toBeChecked();
    press(messages.Generics.edit);
    await waitFor(() =>
      expect(editRecurringTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, daysOfMonth: [1, 15], description: recurrence.description })
      )
    );
  });
  it('loads inbound transfer edits with their outbound source account', () => {
    editExisting({
      type: TransactionType.TRANSFER,
      accountId: 2,
      subcategory: { ...subcategory, name: 'TRANSFER.IN.SUBCATEGORY' },
      linkedTransaction: { accountId: 1 },
    });
    renderForm();
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
    expect(screen.getByText(/Personal → Savings/)).toBeInTheDocument();
  });
  it('filters transfer destinations and sends the system description on save', async () => {
    renderForm();
    press('8');
    fireEvent.click(screen.getByRole('radio', { name: messages.Generics.transfer.singular }));
    fireEvent.click(screen.getByRole('button', { name: /Destination account/i }));
    expect(screen.queryByRole('option', { name: 'Euro · EUR' })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('option', { name: 'Savings · USD' }));
    press('Continue →');
    press('Save transaction');
    await waitFor(() =>
      expect(mockedCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TRANSFER',
          description: 'TRANSFER.OUT.DESCRIPTION',
          accountId: 1,
          destinationAccountId: 2,
        })
      )
    );
  });
  it('changes currency without converting the number and clears arithmetic history', async () => {
    renderForm();
    press('4');
    press('Add');
    press('2');
    fireEvent.click(screen.getByRole('button', { name: /Account/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'Euro · EUR' }));
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveValue('2.00');
    expect(screen.getByRole('status')).toHaveTextContent('Currency changed to EUR');
  });

  it('automatically excludes future entries until the user explicitly changes the setting', () => {
    renderForm();
    continueWithAmount();
    const year = screen.getByRole('spinbutton', { name: /year/i });
    fireEvent.keyDown(year, { key: 'ArrowUp' });
    fireEvent.keyDown(year, { key: 'ArrowUp' });
    const toggle = screen.getByRole('switch', { name: messages.TransactionForm.excludeFromTotals });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    fireEvent.keyDown(year, { key: 'ArrowUp' });
    expect(toggle).not.toBeChecked();
  });
});
