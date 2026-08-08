import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { EditRecurringTransactionButton } from '@/app/transactions/components/ProgrammedTransactionsSection/components/EditRecurringTransactionButton';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { RecurrenceStatus } from '@/types/enums/recurrenceStatus';
import { buildRecurrence } from '@/utils/testFixtures/buildRecurrence';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/components/TransactionForm/TransactionFormProvider', () => ({
  useTransactionForm: jest.fn(),
}));

const mockedUseTransactionForm = useTransactionForm as jest.Mock;

describe('EditRecurringTransactionButton', () => {
  it('opens the recurring form for the given recurrence when pressed', () => {
    const showRecurringTransactionForm = jest.fn();
    mockedUseTransactionForm.mockReturnValue({ showRecurringTransactionForm });
    const activeRecurrence = buildRecurrence({ status: RecurrenceStatus.ACTIVE });

    render(<EditRecurringTransactionButton recurrence={activeRecurrence} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(showRecurringTransactionForm).toHaveBeenCalledWith(activeRecurrence);
  });
});
