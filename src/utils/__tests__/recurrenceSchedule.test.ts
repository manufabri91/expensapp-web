import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { formatScheduleDescription } from '@/utils/recurrenceSchedule';

const fakeTranslator = (key: string, values?: Record<string, string | number>) => `${key}::${JSON.stringify(values)}`;

describe('formatScheduleDescription', () => {
  it('describes an interval recurrence using the configured interval days', () => {
    const intervalRecurrence = { frequency: RecurrenceFrequency.INTERVAL_DAYS, intervalDays: 14, daysOfMonth: [] };

    const description = formatScheduleDescription(intervalRecurrence, fakeTranslator, 'en');

    expect(description).toBe('schedule.everyNDays::{"n":14}');
  });

  it('defaults the interval to zero when intervalDays is missing', () => {
    const intervalRecurrenceWithoutDays = {
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: null,
      daysOfMonth: [],
    };

    const description = formatScheduleDescription(intervalRecurrenceWithoutDays, fakeTranslator, 'en');

    expect(description).toBe('schedule.everyNDays::{"n":0}');
  });

  it('sorts and formats multiple days-of-month with correct ordinal suffixes', () => {
    const monthlyRecurrence = {
      frequency: RecurrenceFrequency.MONTHLY_DAYS,
      intervalDays: null,
      daysOfMonth: [15, 1],
    };

    const description = formatScheduleDescription(monthlyRecurrence, fakeTranslator, 'en');

    expect(description).toBe('schedule.monthlyOn::{"days":"1st, 15th"}');
  });

  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [23, '23rd'],
    [31, '31st'],
  ])('formats day %i as the English ordinal %s', (day, expectedOrdinal) => {
    const monthlyRecurrence = { frequency: RecurrenceFrequency.MONTHLY_DAYS, intervalDays: null, daysOfMonth: [day] };

    const description = formatScheduleDescription(monthlyRecurrence, fakeTranslator, 'en');

    expect(description).toBe(`schedule.monthlyOn::{"days":"${expectedOrdinal}"}`);
  });

  it.each(['es', 'es-AR'])('formats every day the same way in Spanish (%s): a plain "º" suffix', (locale) => {
    const monthlyRecurrence = {
      frequency: RecurrenceFrequency.MONTHLY_DAYS,
      intervalDays: null,
      daysOfMonth: [1, 11, 21, 31],
    };

    const description = formatScheduleDescription(monthlyRecurrence, fakeTranslator, locale);

    expect(description).toBe('schedule.monthlyOn::{"days":"1º, 11º, 21º, 31º"}');
  });
});
