'use client';

import { useTheme } from 'next-themes';
import { ReactNode, useEffect } from 'react';
import { UserSettingsResponse } from '@/types/dto';

// next-themes is localStorage-driven and can't be forced from the server without a flash, so the
// account's theme (fetched server-side in AppProviders) is applied here once mounted instead -
// keeping it in sync across devices/logins rather than falling back to next-themes' local default.
export const UserSettingsProvider = ({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings: UserSettingsResponse;
}) => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (initialSettings.theme !== theme) {
      setTheme(initialSettings.theme);
    }
    // Intentionally re-runs only when the server-fetched setting changes (e.g. a fresh
    // request/login), not on every local `theme` change - otherwise it would fight the user's
    // own ThemeSelector clicks by reverting them back to the stale server value.
  }, [initialSettings.theme]);

  return <>{children}</>;
};
