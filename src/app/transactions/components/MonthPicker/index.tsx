'use client';

import { ButtonGroup } from '@heroui/react';
import { endOfMonth, startOfMonth } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFormatter } from 'next-intl';
import { useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';

export const MonthPicker = () => {
  const { filters, patchFilters } = useTransactionsFilters();
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fall back to the server-derived filters.fromDate (set by transactions/page.tsx) rather than
  // independently recomputing "today" on the client, so the picker never disagrees with the
  // month the server already resolved and rendered (e.g. MonthSummary).
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  const year = yearParam ? Number(yearParam) : filters.fromDate.getFullYear();
  const month = monthParam ? Number(monthParam) : filters.fromDate.getMonth() + 1;

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
    <div className="flex flex-col gap-2">
      <ButtonGroup variant="tertiary">
        <Button onPress={onPrevMonthHandler}>
          <HiChevronLeft />
        </Button>
        <Button onPress={onResetToFullMonth}>
          <ButtonGroup.Separator />
          {format.dateTime(new Date(year, month - 1), { year: 'numeric', month: 'long' })}
        </Button>
        <Button onPress={onNextMonthHandler}>
          <ButtonGroup.Separator />
          <HiChevronRight />
        </Button>
      </ButtonGroup>
    </div>
  );
};
