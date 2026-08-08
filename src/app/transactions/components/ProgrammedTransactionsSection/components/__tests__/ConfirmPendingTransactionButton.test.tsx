import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ConfirmPendingTransactionButton } from '@/app/transactions/components/ProgrammedTransactionsSection/components/ConfirmPendingTransactionButton';
import { confirmTransaction } from '@/lib/actions/transactions';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/transactions', () => ({
  confirmTransaction: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedConfirmTransaction = confirmTransaction as jest.Mock;

describe('ConfirmPendingTransactionButton', () => {
  beforeEach(() => {
    mockedConfirmTransaction.mockReset();
  });

  it('confirms the pending transaction and notifies the caller when pressed', async () => {
    mockedConfirmTransaction.mockResolvedValue({ id: 42 });
    const onChanged = jest.fn();

    render(<ConfirmPendingTransactionButton transactionId={42} onChanged={onChanged} />);
    expect(screen.getByText('confirm')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedConfirmTransaction).toHaveBeenCalledWith(42));
    expect(onChanged).toHaveBeenCalled();
  });

  it('confirms without any intermediate confirmation dialog', async () => {
    mockedConfirmTransaction.mockResolvedValue({ id: 42 });

    render(<ConfirmPendingTransactionButton transactionId={42} onChanged={jest.fn()} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedConfirmTransaction).toHaveBeenCalled());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows a danger toast and does not call onChanged when the confirmation fails', async () => {
    mockedConfirmTransaction.mockRejectedValue(new Error('network down'));
    const onChanged = jest.fn();

    render(<ConfirmPendingTransactionButton transactionId={42} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(toast.danger).toHaveBeenCalledWith('network down'));
    expect(onChanged).not.toHaveBeenCalled();
  });
});
