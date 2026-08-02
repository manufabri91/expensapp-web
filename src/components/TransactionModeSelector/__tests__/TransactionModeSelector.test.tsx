import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TransactionModeSelector } from '@/components/TransactionModeSelector';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('TransactionModeSelector', () => {
  it('renders both the one-time and recurring options', () => {
    render(<TransactionModeSelector onSelect={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'oneTime' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'recurring' })).toBeInTheDocument();
  });

  it('marks the initialValue option as selected', () => {
    render(<TransactionModeSelector initialValue="recurring" onSelect={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'recurring' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'oneTime' })).not.toBeChecked();
  });

  it('calls onSelect with "recurring" when the recurring option is chosen', () => {
    const onSelect = jest.fn();
    render(<TransactionModeSelector initialValue="oneTime" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('radio', { name: 'recurring' }));

    expect(onSelect).toHaveBeenCalledWith('recurring');
  });

  it('calls onSelect with "oneTime" when the one-time option is chosen', () => {
    const onSelect = jest.fn();
    render(<TransactionModeSelector initialValue="recurring" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('radio', { name: 'oneTime' }));

    expect(onSelect).toHaveBeenCalledWith('oneTime');
  });
});
