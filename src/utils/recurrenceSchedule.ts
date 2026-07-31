import { RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';

const ordinal = (day: number): string => {
  if (day % 10 === 1 && day % 100 !== 11) return `${day}st`;
  if (day % 10 === 2 && day % 100 !== 12) return `${day}nd`;
  if (day % 10 === 3 && day % 100 !== 13) return `${day}rd`;
  return `${day}th`;
};

type ScheduleTranslator = (key: string, values?: Record<string, string | number>) => string;

export const formatScheduleDescription = (
  recurrence: Pick<RecurringTransactionResponse, 'frequency' | 'intervalDays' | 'daysOfMonth'>,
  t: ScheduleTranslator
): string => {
  if (recurrence.frequency === RecurrenceFrequency.INTERVAL_DAYS) {
    return t('schedule.everyNDays', { n: recurrence.intervalDays ?? 0 });
  }

  const days = [...recurrence.daysOfMonth]
    .sort((a, b) => a - b)
    .map(ordinal)
    .join(', ');
  return t('schedule.monthlyOn', { days });
};
