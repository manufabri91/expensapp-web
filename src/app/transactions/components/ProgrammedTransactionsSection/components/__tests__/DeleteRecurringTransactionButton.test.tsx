import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { DeleteRecurringTransactionButton } from '@/app/transactions/components/ProgrammedTransactionsSection/components/DeleteRecurringTransactionButton';
import { deleteRecurringTransactionById } from '@/lib/actions/recurringTransactions';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/recurringTransactions', () => ({
  deleteRecurringTransactionById: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedDelete = deleteRecurringTransactionById as jest.Mock;

describe('DeleteRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it('deletes the recurrence once the confirmation dialog is accepted', async () => {
    mockedDelete.mockResolvedValue({ success: true, message: 'deleted' });
    const onChanged = jest.fn();
    render(<DeleteRecurringTransactionButton recurrence={buildRecurrence({ status: RecurrenceStatus.ACTIVE })} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });
});
