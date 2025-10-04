'use client';

import { endOfMonth, startOfMonth } from 'date-fns';
import { useFormatter } from 'next-intl';

import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';

export const MonthPicker = () => {
  const { filters, patchFilters } = useTransactionsFilters();
  const format = useFormatter();
  const [year, setYear] = useState<number>(filters.fromDate.getFullYear());
  const [month, setMonth] = useState<number>(filters.fromDate.getMonth() + 1);

  const onPrevMonthHandler = () => {
    if (month == 1) {
      setYear((prev) => prev - 1);
      setMonth(12);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const onNextMonthHandler = () => {
    if (month == 12) {
      setYear((prev) => prev + 1);
      setMonth(1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const fromDate = startOfMonth(Date.UTC(year, month - 1));
    const toDate = endOfMonth(Date.UTC(year, month - 1));
    patchFilters({ fromDate, toDate });
  }, [year, month, patchFilters]);

  return (
    <div className="mt-8 flex items-center justify-center gap-4 md:mt-16 md:gap-8">
      <Button color="primary" variant="ghost" onPress={onPrevMonthHandler} size="sm">
        <HiChevronLeft />
      </Button>
      <span>{format.dateTime(new Date(year, month - 1), { year: 'numeric', month: 'long' })}</span>
      <Button color="primary" variant="ghost" onPress={onNextMonthHandler} size="sm">
        <HiChevronRight />
      </Button>
    </div>
  );
};
