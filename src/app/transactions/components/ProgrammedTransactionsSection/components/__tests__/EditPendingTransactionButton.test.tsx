import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { EditPendingTransactionButton } from '@/app/transactions/components/ProgrammedTransactionsSection/components/EditPendingTransactionButton';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { getTransactionById } from '@/lib/actions/transactions';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/components/TransactionForm/TransactionFormProvider', () => ({
  useTransactionForm: jest.fn(),
}));

jest.mock('@/lib/actions/transactions', () => ({
  getTransactionById: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedUseTransactionForm = useTransactionForm as jest.Mock;
const mockedGetTransactionById = getTransactionById as jest.Mock;

describe('EditPendingTransactionButton', () => {
  beforeEach(() => {
    mockedGetTransactionById.mockReset();
    (toast.danger as jest.Mock).mockReset();
  });

  it('fetches the full transaction and opens the one-time form with it when pressed', async () => {
    const showTransactionForm = jest.fn();
    mockedUseTransactionForm.mockReturnValue({ showTransactionForm });
    const fullTransaction = { id: 55, description: 'Rent' };
    mockedGetTransactionById.mockResolvedValue(fullTransaction);

    render(<EditPendingTransactionButton transactionId={55} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    await waitFor(() => expect(mockedGetTransactionById).toHaveBeenCalledWith(55));
    expect(showTransactionForm).toHaveBeenCalledWith(fullTransaction);
  });

  it('shows a danger toast and does not open the form when the fetch fails', async () => {
    const showTransactionForm = jest.fn();
    mockedUseTransactionForm.mockReturnValue({ showTransactionForm });
    mockedGetTransactionById.mockRejectedValue(new Error('network down'));

    render(<EditPendingTransactionButton transactionId={55} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    await waitFor(() => expect(toast.danger).toHaveBeenCalledWith('network down'));
    expect(showTransactionForm).not.toHaveBeenCalled();
  });
});
