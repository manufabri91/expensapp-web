import { Locale } from '@/i18n/config';

export type Theme = 'system' | 'light' | 'dark';

export interface UserSettingsRequest {
  theme?: Theme;
  locale?: Locale;
}
