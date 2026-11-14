'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccountPreferences, parseAccountPreferences, validAccountPreferences } from '@/utils/accountPreferences';
import { useAccounts } from './AccountsProvider';

interface PreferencesContext extends AccountPreferences {
  ready: boolean;
  persistent: boolean;
  setDefault: (accountId?: number) => void;
  rememberRecent: (accountId?: number) => void;
}
const Context = createContext<PreferencesContext>({
  ready: true,
  persistent: false,
  setDefault: () => {},
  rememberRecent: () => {},
});
export const useAccountPreferences = () => useContext(Context);

export const AccountPreferencesProvider = ({ userId, children }: { userId: string; children: ReactNode }) => {
  const { accounts } = useAccounts();
  const key = `expensapp:account-preferences:v1:${userId}`;
  const [preferences, setPreferences] = useState<AccountPreferences>({});
  const [loadedKey, setLoadedKey] = useState('');
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    const read = () => {
      try {
        setPreferences(parseAccountPreferences(localStorage.getItem(key)));
        const probe = `${key}:probe`;
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        setPersistent(true);
      } catch {
        setPreferences({});
        setPersistent(false);
      }
      setLoadedKey(key);
    };
    read();
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) read();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);
  const current = loadedKey === key ? validAccountPreferences(accounts, preferences) : {};
  const update = (patch: AccountPreferences) => {
    const next = { ...current, ...patch };
    setPreferences(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setPersistent(false);
    }
  };
  return (
    <Context.Provider
      value={{
        ...current,
        ready: loadedKey === key,
        persistent,
        setDefault: (defaultAccountId) => update({ defaultAccountId }),
        rememberRecent: (recentAccountId) => update({ recentAccountId }),
      }}
    >
      {children}
    </Context.Provider>
  );
};
