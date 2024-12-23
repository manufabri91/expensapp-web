'use client';

import { Button, ButtonVariant } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

export const MonthPicker = () => {
  const { filters, patchFilters } = useTransactionsFilters();
  const [year, setYear] = useState<number>(filters.year);
  const [month, setMonth] = useState<number>(filters.month);

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
    patchFilters({ year, month });
  }, [year, month, patchFilters]);

  return (
    <div className="mt-4 flex items-center justify-center gap-4">
      <Button variant={ButtonVariant.Secondary} onClick={onPrevMonthHandler}>
        <HiChevronLeft />
      </Button>
      <span>{format(new Date(filters.year, filters.month - 1), 'MMMM yy')}</span>
      <Button variant={ButtonVariant.Secondary} onClick={onNextMonthHandler}>
        <HiChevronRight />
      </Button>
    </div>
  );
};
