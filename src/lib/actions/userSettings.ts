'use server';

import { backendFetch } from '@/lib/api/backendFetch';
import { UserSettingsRequest, UserSettingsResponse } from '@/types/dto';

// The backend stores/returns theme as the Java enum name (SYSTEM/LIGHT/DARK); next-themes works
// with lowercase values, so this module is the single place that converts between the two.
type BackendUserSettings = {
  theme: 'SYSTEM' | 'LIGHT' | 'DARK';
  locale: string;
};

const fromBackend = (settings: BackendUserSettings): UserSettingsResponse => ({
  theme: settings.theme.toLowerCase() as UserSettingsResponse['theme'],
  locale: settings.locale as UserSettingsResponse['locale'],
});

const toBackend = (settings: UserSettingsRequest): Partial<BackendUserSettings> => ({
  ...(settings.theme !== undefined ? { theme: settings.theme.toUpperCase() as BackendUserSettings['theme'] } : {}),
  ...(settings.locale !== undefined ? { locale: settings.locale } : {}),
});

export const getUserSettings = async (): Promise<UserSettingsResponse> => {
  const response = await backendFetch('/user-settings');
  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }
  return fromBackend(await response.json());
};

export const updateUserSettings = async (settings: UserSettingsRequest): Promise<UserSettingsResponse> => {
  const response = await backendFetch('/user-settings', { method: 'PATCH', body: toBackend(settings) });
  if (!response.ok) {
    throw new Error('Failed to update user settings');
  }
  return fromBackend(await response.json());
};
