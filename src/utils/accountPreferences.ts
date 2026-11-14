import { AccountResponse } from '@/types/dto';

export interface AccountPreferences {
  defaultAccountId?: number;
  recentAccountId?: number;
}
export const parseAccountPreferences = (raw: string | null): AccountPreferences => {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object') return {};
    const record = value as Record<string, unknown>;
    return {
      defaultAccountId: Number.isSafeInteger(record.defaultAccountId) ? (record.defaultAccountId as number) : undefined,
      recentAccountId: Number.isSafeInteger(record.recentAccountId) ? (record.recentAccountId as number) : undefined,
    };
  } catch {
    return {};
  }
};
export const resolveOpeningAccount = (accounts: AccountResponse[], candidates: (number | undefined)[]) =>
  candidates.find((candidate) => accounts.some((account) => account.id === candidate));
export const validAccountPreferences = (
  accounts: AccountResponse[],
  preferences: AccountPreferences
): AccountPreferences => ({
  defaultAccountId: resolveOpeningAccount(accounts, [preferences.defaultAccountId]),
  recentAccountId: resolveOpeningAccount(accounts, [preferences.recentAccountId]),
});
