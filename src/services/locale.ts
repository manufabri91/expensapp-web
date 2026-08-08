'use server';

import { cookies } from 'next/headers';
import { defaultLocale, Locale } from '@/i18n/config';
import { getUserSettings, updateUserSettings } from '@/lib/actions/userSettings';
import { auth } from '@/lib/auth';
import { hasValidSession } from '@/lib/auth/session';

// The NEXT_LOCALE cookie is the fast/guest-friendly path (read on every request by
// i18n/request.ts). For a logged-in user, the account's saved locale is the source of truth so
// preferences follow the account across devices/logins instead of resetting - see the
// `usersettings` backend table.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale(): Promise<Locale> {
  const session = await auth();
  if (hasValidSession(session)) {
    try {
      return (await getUserSettings()).locale;
    } catch (error) {
      console.error('[getUserLocale] failed to fetch user settings from backend:', error);
    }
  }

  return ((await cookies()).get(COOKIE_NAME)?.value as Locale) || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);

  const session = await auth();
  if (hasValidSession(session)) {
    try {
      await updateUserSettings({ locale });
    } catch (error) {
      console.error('[setUserLocale] failed to persist locale to backend:', error);
    }
  }
}
