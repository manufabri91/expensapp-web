'use client';

import { endOfMonth, startOfMonth } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFormatter } from 'next-intl';
import { useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { getYearMonthFromParams } from '@/lib/utils/date';

export const MonthPicker = () => {
  const { patchFilters } = useTransactionsFilters();
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { year, month } = getYearMonthFromParams(searchParams.get('year'), searchParams.get('month'));

  const navigateToMonth = (nextYear: number, nextMonth: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', String(nextYear));
    params.set('month', String(nextMonth));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const onPrevMonthHandler = () => {
    if (month === 1) {
      navigateToMonth(year - 1, 12);
    } else {
      navigateToMonth(year, month - 1);
    }
  };

  const onNextMonthHandler = () => {
    if (month === 12) {
      navigateToMonth(year + 1, 1);
    } else {
      navigateToMonth(year, month + 1);
    }
  };

  useEffect(() => {
    const fromDate = startOfMonth(new Date(year, month - 1));
    const toDate = endOfMonth(new Date(year, month - 1));
    patchFilters({ fromDate, toDate });
  }, [year, month, patchFilters]);

  const onResetToFullMonth = () => {
    patchFilters({
      currentPage: 1,
      fromDate: startOfMonth(new Date(year, month - 1)),
      toDate: endOfMonth(new Date(year, month - 1)),
    });
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="ghost" onPress={onPrevMonthHandler} size="sm">
        <HiChevronLeft />
      </Button>
      <Button variant="ghost" onPress={onResetToFullMonth} size="sm">
        {format.dateTime(new Date(year, month - 1), { year: 'numeric', month: 'long' })}
      </Button>
      <Button variant="ghost" onPress={onNextMonthHandler} size="sm">
        <HiChevronRight />
      </Button>
    </div>
  );
};
