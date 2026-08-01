import { RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';

// Intl.PluralRules only tells us WHICH ordinal category a number falls into (CLDR doesn't ship the
// suffix text itself) - it's what correctly distinguishes "1st"/"11th" in English without
// reimplementing that exception by hand. Spanish has no distinct ordinal categories (every number
// maps to "other"), so its day-of-month convention is simply "1º", "2º", etc.
const ORDINAL_SUFFIXES_BY_LANGUAGE: Record<string, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  en: { one: 'st', two: 'nd', few: 'rd', other: 'th' },
};
const DEFAULT_ORDINAL_SUFFIX = 'º';

const pluralRulesByLocale = new Map<string, Intl.PluralRules>();
const getOrdinalPluralRules = (locale: string): Intl.PluralRules => {
  let rules = pluralRulesByLocale.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale, { type: 'ordinal' });
    pluralRulesByLocale.set(locale, rules);
  }
  return rules;
};

const ordinal = (day: number, locale: string): string => {
  const language = locale.split('-')[0];
  const suffixes = ORDINAL_SUFFIXES_BY_LANGUAGE[language];
  if (!suffixes) return `${day}${DEFAULT_ORDINAL_SUFFIX}`;

  const category = getOrdinalPluralRules(locale).select(day);
  return `${day}${suffixes[category] ?? suffixes.other ?? DEFAULT_ORDINAL_SUFFIX}`;
};

type ScheduleTranslator = (key: string, values?: Record<string, string | number>) => string;

export const formatScheduleDescription = (
  recurrence: Pick<RecurringTransactionResponse, 'frequency' | 'intervalDays' | 'daysOfMonth'>,
  t: ScheduleTranslator,
  locale: string
): string => {
  if (recurrence.frequency === RecurrenceFrequency.INTERVAL_DAYS) {
    return t('schedule.everyNDays', { n: recurrence.intervalDays ?? 0 });
  }

  const days = [...recurrence.daysOfMonth]
    .sort((a, b) => a - b)
    .map((day) => ordinal(day, locale))
    .join(', ');
  return t('schedule.monthlyOn', { days });
};
