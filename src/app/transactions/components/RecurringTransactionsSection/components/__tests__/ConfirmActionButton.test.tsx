import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { HiTrash } from 'react-icons/hi2';
import { ConfirmActionButton } from '@/app/transactions/components/RecurringTransactionsSection/components/ConfirmActionButton';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

describe('ConfirmActionButton', () => {
  it('does not call onConfirm until the confirmation dialog is accepted', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <ConfirmActionButton label="delete" icon={HiTrash} titleKey="deleteConfirm.title" bodyKey="deleteConfirm.body" onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(onConfirm).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  });

  it('closes the dialog without calling onConfirm when dismissed', async () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmActionButton label="delete" icon={HiTrash} titleKey="deleteConfirm.title" bodyKey="deleteConfirm.body" onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[0]);

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows a danger toast and keeps the dialog open when onConfirm fails', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('network down'));
    render(
      <ConfirmActionButton label="delete" icon={HiTrash} titleKey="deleteConfirm.title" bodyKey="deleteConfirm.body" onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(toast.danger).toHaveBeenCalledWith('network down'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
