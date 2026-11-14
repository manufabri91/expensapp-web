import { fireEvent, render, screen } from '@testing-library/react';
import { TransactionFormProvider, useTransactionForm } from '../TransactionFormProvider';

jest.mock('@/components/TransactionForm', () => ({ TransactionForm: () => null }));
const Controls = () => {
  const form = useTransactionForm();
  return (
    <>
      <output>{`${form.formMode}:${form.openingAccountId ?? 'none'}:${form.overlayState.isOpen}`}</output>
      <button onClick={() => form.showTransactionForm(undefined, { accountId: 3 })}>New</button>
      <button onClick={() => form.showRecurringTransactionForm(undefined, { accountId: 2 })}>Recurring</button>
      <button onClick={() => form.clearForm()}>Clear</button>
    </>
  );
};
describe('transaction form opening context', () => {
  it('passes explicit context for both creation modes and clears it', () => {
    render(
      <TransactionFormProvider>
        <Controls />
      </TransactionFormProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(screen.getByRole('status')).toHaveTextContent('oneTime:3:true');
    fireEvent.click(screen.getByRole('button', { name: 'Recurring' }));
    expect(screen.getByRole('status')).toHaveTextContent('recurring:2:true');
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('status')).toHaveTextContent('oneTime:none:true');
  });
});
