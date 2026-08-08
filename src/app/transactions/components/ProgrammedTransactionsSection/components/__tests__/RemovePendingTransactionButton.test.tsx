import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { RemovePendingTransactionButton } from '@/app/transactions/components/ProgrammedTransactionsSection/components/RemovePendingTransactionButton';
import { deleteTransactionById } from '@/lib/actions/transactions';

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => (namespace ? `${namespace}.${key}` : key),
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/transactions', () => ({
  deleteTransactionById: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedDeleteTransactionById = deleteTransactionById as jest.Mock;

describe('RemovePendingTransactionButton', () => {
  beforeEach(() => {
    mockedDeleteTransactionById.mockReset();
  });

  it('does not delete the transaction until the confirmation dialog is accepted', async () => {
    mockedDeleteTransactionById.mockResolvedValue({ success: true, message: 'deleted' });
    const onChanged = jest.fn();

    render(<RemovePendingTransactionButton transactionId={7} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'ProgrammedTransactions.actions.remove' }));
    expect(mockedDeleteTransactionById).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(mockedDeleteTransactionById).toHaveBeenCalledWith(7));
    expect(onChanged).toHaveBeenCalled();
  });

  it('resolves its confirmation copy against the ProgrammedTransactions namespace', async () => {
    render(<RemovePendingTransactionButton transactionId={7} onChanged={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'ProgrammedTransactions.actions.remove' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('ProgrammedTransactions.removeConfirm.title')).toBeInTheDocument();
    expect(within(dialog).getByText('ProgrammedTransactions.removeConfirm.body')).toBeInTheDocument();
  });
});
