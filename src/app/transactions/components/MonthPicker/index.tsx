'use client';

import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';

export const MonthPicker = () => {
  const { filters, patchFilters } = useTransactionsFilters();
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
    <div className="mt-8 flex items-center justify-center gap-8 md:mt-16 md:gap-16">
      <Button color="primary" variant="bordered" onPress={onPrevMonthHandler}>
        <HiChevronLeft />
      </Button>
      <span>{format(new Date(year, month - 1), 'MMMM yy')}</span>
      <Button color="primary" variant="bordered" onPress={onNextMonthHandler}>
        <HiChevronRight />
      </Button>
    </div>
  );
};
