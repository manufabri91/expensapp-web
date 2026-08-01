import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { CancelRecurringTransactionButton } from '@/app/transactions/components/RecurringTransactionsSection/components/CancelRecurringTransactionButton';
import { cancelRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '../testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/recurringTransactions', () => ({
  cancelRecurringTransaction: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedCancel = cancelRecurringTransaction as jest.Mock;

describe('CancelRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedCancel.mockReset();
  });

  it('does not cancel the recurrence until the confirmation dialog is accepted', async () => {
    const onChanged = jest.fn();
    render(<CancelRecurringTransactionButton recurrence={buildRecurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockedCancel).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(mockedCancel).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });
});
