import { Locale } from '@/i18n/config';
import { Theme } from './userSettingsRequest';

export interface UserSettingsResponse {
  theme: Theme;
  locale: Locale;
}
