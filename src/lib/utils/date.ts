import { parseISO } from 'date-fns';

export const getYearMonthFromParams = (
  year?: string | null,
  month?: string | null
): { year: number; month: number } => {
  const now = new Date();
  return {
    year: year ? Number(year) : now.getFullYear(),
    month: month ? Number(month) : now.getMonth() + 1,
  };
};

// A plain YYYY-MM-DD calendar date has no time/timezone info. parseISO() treats a date-only
// string as midnight in the SERVER's local timezone, which would make the same calendar date
// shift by a day depending on the server's timezone relative to UTC. Anchor it explicitly at UTC
// midnight and serialize with toISOString() (always UTC, always 'Z') so the round trip is
// timezone-independent and always represents the exact calendar date the user picked. The backend
// deserializes this into an OffsetDateTime, which accepts this format fine.
export const parseCalendarDateOnly = (date: string | null): string | null => {
  if (!date) return null;
  return parseISO(`${date}T00:00:00.000Z`).toISOString();
};

// `url` historically referred to this app's own `/api/...` route handlers; the backend exposes
// the same paths without the `/api` prefix.
export const toBackendPath = (url: string): string => url.replace(/^\/api/, '');
