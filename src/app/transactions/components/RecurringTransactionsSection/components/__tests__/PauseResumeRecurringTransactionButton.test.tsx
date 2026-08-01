import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PauseResumeRecurringTransactionButton } from '@/app/transactions/components/RecurringTransactionsSection/components/PauseResumeRecurringTransactionButton';
import { pauseRecurringTransaction, resumeRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '../testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/recurringTransactions', () => ({
  pauseRecurringTransaction: jest.fn(),
  resumeRecurringTransaction: jest.fn(),
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

const mockedPause = pauseRecurringTransaction as jest.Mock;
const mockedResume = resumeRecurringTransaction as jest.Mock;

describe('PauseResumeRecurringTransactionButton', () => {
  beforeEach(() => {
    mockedPause.mockReset();
    mockedResume.mockReset();
  });

  it('shows "pause" and calls pauseRecurringTransaction for an active recurrence', async () => {
    mockedPause.mockResolvedValue(undefined);
    const onChanged = jest.fn();

    render(
      <PauseResumeRecurringTransactionButton recurrence={buildRecurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />
    );
    expect(screen.getByText('pause')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedPause).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });

  it('shows "resume" and calls resumeRecurringTransaction for a paused recurrence', async () => {
    mockedResume.mockResolvedValue(undefined);
    const onChanged = jest.fn();

    render(
      <PauseResumeRecurringTransactionButton recurrence={buildRecurrence(RecurrenceStatus.PAUSED)} onChanged={onChanged} />
    );
    expect(screen.getByText('resume')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(mockedResume).toHaveBeenCalledWith(1));
    expect(onChanged).toHaveBeenCalled();
  });

  it('shows a danger toast and does not call onChanged when the action fails', async () => {
    mockedPause.mockRejectedValue(new Error('network down'));
    const onChanged = jest.fn();

    render(
      <PauseResumeRecurringTransactionButton recurrence={buildRecurrence(RecurrenceStatus.ACTIVE)} onChanged={onChanged} />
    );
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(toast.danger).toHaveBeenCalledWith('network down'));
    expect(onChanged).not.toHaveBeenCalled();
  });
});
