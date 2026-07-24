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
