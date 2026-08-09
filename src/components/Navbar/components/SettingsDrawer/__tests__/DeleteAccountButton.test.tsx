import { toast } from '@heroui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DeleteAccountButton } from '@/components/Navbar/components/SettingsDrawer/DeleteAccountButton';
import { clientLogout } from '@/lib/auth/clientLogout';

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => (namespace ? `${namespace}.${key}` : key),
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@heroui/react', () => {
  const actual = jest.requireActual('@heroui/react');
  return { ...actual, toast: { success: jest.fn(), danger: jest.fn() } };
});

jest.mock('@/lib/auth/clientLogout', () => ({ clientLogout: jest.fn() }));

const mockedHandleLogoutAction = clientLogout as jest.Mock;

describe('DeleteAccountButton', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockedHandleLogoutAction.mockReset();
  });

  it('does not call the delete API until the confirmation dialog is accepted', () => {
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole('button', { name: /deleteMyAccount/ }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('deletes the account and signs out when confirmed', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole('button', { name: /deleteMyAccount/ }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/privacy/delete-account', { method: 'DELETE' }));
    await waitFor(() => expect(mockedHandleLogoutAction).toHaveBeenCalled());
  });

  it('shows a danger toast and does not sign out when the delete request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole('button', { name: /deleteMyAccount/ }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[1]);

    await waitFor(() => expect(toast.danger).toHaveBeenCalled());
    expect(mockedHandleLogoutAction).not.toHaveBeenCalled();
  });

  it('closes the dialog without deleting when cancelled', async () => {
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole('button', { name: /deleteMyAccount/ }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getAllByRole('button')[0]);

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
