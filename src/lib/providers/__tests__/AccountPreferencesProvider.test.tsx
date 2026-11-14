import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { DefaultAccountSelector } from '@/components/Navbar/components/SettingsDrawer/DefaultAccountSelector';
import messages from '../../../../messages/en.json';
import { AccountPreferencesProvider, useAccountPreferences } from '../AccountPreferencesProvider';
import { AccountsProvider } from '../AccountsProvider';

const accounts = [1, 2].map((id) => ({
  id,
  name: id === 1 ? 'Personal' : 'Savings',
  currency: 'USD',
  accountBalance: 0,
  initialBalance: 0,
}));
const key = (user: string) => `expensapp:account-preferences:v1:${user}`;
const Probe = () => {
  const preferences = useAccountPreferences();
  return (
    <>
      <output data-testid="preferences">{JSON.stringify(preferences)}</output>
      <button onClick={() => preferences.setDefault(2)}>Set default</button>
      <button onClick={() => preferences.rememberRecent(1)}>Remember recent</button>
    </>
  );
};
const wrapper = (user: string, availableAccounts = accounts) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    <AccountsProvider initialAccounts={availableAccounts}>
      <AccountPreferencesProvider userId={user}>
        <Probe />
        <DefaultAccountSelector />
      </AccountPreferencesProvider>
    </AccountsProvider>
  </NextIntlClientProvider>
);

describe('browser account preferences and settings', () => {
  beforeEach(() => localStorage.clear());
  it('loads, updates, and clears the user default through Settings', async () => {
    localStorage.setItem(key('alice'), JSON.stringify({ defaultAccountId: 1 }));
    render(wrapper('alice'));
    await waitFor(() => expect(screen.getByTestId('preferences')).toHaveTextContent('"defaultAccountId":1'));
    fireEvent.click(screen.getByRole('button', { name: 'Set default' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remember recent' }));
    expect(JSON.parse(localStorage.getItem(key('alice'))!)).toEqual({ defaultAccountId: 2, recentAccountId: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'No default' }));
    expect(JSON.parse(localStorage.getItem(key('alice'))!)).toEqual({ recentAccountId: 1 });
  });
  it('isolates accounts when the signed-in user changes', async () => {
    localStorage.setItem(key('alice'), '{"defaultAccountId":1}');
    localStorage.setItem(key('bob'), '{"defaultAccountId":2}');
    const view = render(wrapper('alice'));
    await waitFor(() => expect(screen.getByTestId('preferences')).toHaveTextContent('"defaultAccountId":1'));
    view.rerender(wrapper('bob'));
    await waitFor(() => expect(screen.getByTestId('preferences')).toHaveTextContent('"defaultAccountId":2'));
  });
  it('ignores deleted preferences and responds to another tab', async () => {
    localStorage.setItem(key('alice'), '{"defaultAccountId":99}');
    render(wrapper('alice'));
    expect(screen.getByTestId('preferences')).not.toHaveTextContent('99');
    act(() => {
      localStorage.setItem(key('alice'), '{"defaultAccountId":2}');
      window.dispatchEvent(new StorageEvent('storage', { key: key('alice') }));
    });
    await waitFor(() => expect(screen.getByTestId('preferences')).toHaveTextContent('"defaultAccountId":2'));
  });
  it('keeps preferences in memory when browser storage is blocked', async () => {
    const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(wrapper('alice'));
    await waitFor(() => expect(screen.getByText(messages.AmountFlow.storageUnavailable)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Set default' }));
    expect(screen.getByTestId('preferences')).toHaveTextContent('"defaultAccountId":2');
    get.mockRestore();
    set.mockRestore();
  });
  it('allows choosing an account from the settings picker', async () => {
    render(wrapper('alice'));
    fireEvent.click(screen.getByRole('button', { name: /Default account/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'Savings · USD' }));
    expect(JSON.parse(localStorage.getItem(key('alice'))!)).toEqual({ defaultAccountId: 2 });
  });
});
