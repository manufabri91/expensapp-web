'use client';

import {
  DateField,
  DateRangePicker,
  Label,
  Popover,
  RangeCalendar,
  Tag,
  TagGroup,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import type { Key } from '@heroui/react';
import { getLocalTimeZone, fromDate as toCalendarDate } from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { endOfDay, startOfDay } from 'date-fns';
import { useTranslations } from 'next-intl';
import React, { Suspense, useMemo, useState } from 'react';
import { HiOutlineFunnel } from 'react-icons/hi2';
import { MonthPicker } from '@/app/transactions/components/MonthPicker';
import { Button } from '@/components/Button';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { SubCategoryResponse } from '@/types/dto';
import { isCustomDateRange } from '@/types/viewModel/transactionFilters';

type DateMode = 'month' | 'range';

export const TransactionFiltersBar = () => {
  const t = useTranslations();
  const trySystemTranslations = useTrySystemTranslations();
  const { categories, getSubcategoriesByCategoryId } = useCategories();
  const { accounts } = useAccounts();
  const { filters, patchFilters } = useTransactionsFilters();

  const [selectedCategories, setSelectedCategories] = useState<Key[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Key[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Key[]>([]);
  const [dateMode, setDateMode] = useState<DateMode>(() =>
    isCustomDateRange(filters, filters.fromDate.getFullYear(), filters.fromDate.getMonth() + 1) ? 'range' : 'month'
  );

  const availableSubcategories = useMemo(() => {
    const seen = new Set<number>();
    const result: SubCategoryResponse[] = [];
    for (const key of selectedCategories) {
      for (const subcategory of getSubcategoriesByCategoryId(Number(key))) {
        if (!seen.has(subcategory.id)) {
          seen.add(subcategory.id);
          result.push(subcategory);
        }
      }
    }
    return result;
  }, [selectedCategories, getSubcategoriesByCategoryId]);

  const onCategoriesChange = (keys: Key[]) => {
    setSelectedCategories(keys);
    const validSubcategoryIds = new Set(
      keys.flatMap((key) => getSubcategoriesByCategoryId(Number(key)).map((subcategory) => subcategory.id))
    );
    const nextSubcategories = selectedSubcategories.filter((key) => validSubcategoryIds.has(Number(key)));
    setSelectedSubcategories(nextSubcategories);
    patchFilters({
      currentPage: 1,
      categoryIds: keys.map(Number),
      subcategoryIds: nextSubcategories.map(Number),
    });
  };

  const onSubcategoriesChange = (keys: Key[]) => {
    setSelectedSubcategories(keys);
    patchFilters({ currentPage: 1, subcategoryIds: keys.map(Number) });
  };

  const onAccountsChange = (keys: Key[]) => {
    setSelectedAccounts(keys);
    patchFilters({ currentPage: 1, accountIds: keys.map(Number) });
  };

  const dateRangeValue = useMemo(
    () => ({
      start: toCalendarDate(filters.fromDate, getLocalTimeZone()),
      end: toCalendarDate(filters.toDate, getLocalTimeZone()),
    }),
    [filters.fromDate, filters.toDate]
  );

  const onDateRangeChange = (range: { start: DateValue; end: DateValue } | null) => {
    if (!range) return;
    patchFilters({
      currentPage: 1,
      fromDate: startOfDay(range.start.toDate(getLocalTimeZone())),
      toDate: endOfDay(range.end.toDate(getLocalTimeZone())),
    });
  };

  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="secondary">
          <HiOutlineFunnel />
          {t('Transactions.filters.title')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96">
        <Popover.Dialog>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[dateMode]}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as DateMode | undefined;
                  if (next) setDateMode(next);
                }}
              >
                <ToggleButton id="month">{t('Transactions.filters.month')}</ToggleButton>
                <ToggleButton id="range">{t('Transactions.filters.dateRange')}</ToggleButton>
              </ToggleButtonGroup>

              {dateMode === 'month' ? (
                <Suspense>
                  <MonthPicker />
                </Suspense>
              ) : (
                <DateRangePicker
                  aria-label={t('Transactions.filters.dateRange')}
                  value={dateRangeValue}
                  onChange={onDateRangeChange}
                  granularity="day"
                >
                  <DateField.Group fullWidth>
                    <DateField.Input slot="start">
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                    <DateRangePicker.RangeSeparator />
                    <DateField.Input slot="end">{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
                    <DateField.Suffix>
                      <DateRangePicker.Trigger>
                        <DateRangePicker.TriggerIndicator />
                      </DateRangePicker.Trigger>
                    </DateField.Suffix>
                  </DateField.Group>
                  <DateRangePicker.Popover>
                    <RangeCalendar aria-label={t('Transactions.filters.dateRange')}>
                      <RangeCalendar.Header>
                        <RangeCalendar.Heading />
                        <RangeCalendar.NavButton slot="previous" />
                        <RangeCalendar.NavButton slot="next" />
                      </RangeCalendar.Header>
                      <RangeCalendar.Grid>
                        <RangeCalendar.GridHeader>
                          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                        </RangeCalendar.GridHeader>
                        <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
                      </RangeCalendar.Grid>
                    </RangeCalendar>
                  </DateRangePicker.Popover>
                </DateRangePicker>
              )}
            </div>
            <TagGroup
              selectionMode="multiple"
              selectedKeys={new Set(selectedAccounts)}
              onSelectionChange={(keys) => onAccountsChange(Array.from(keys as Set<Key>))}
            >
              <Label>{t('Transactions.filters.accounts')}</Label>
              <TagGroup.List items={accounts} renderEmptyState={() => null}>
                {(account) => (
                  <Tag id={account.id.toString()} textValue={account.name}>
                    {account.name}
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>
            <TagGroup
              selectionMode="multiple"
              selectedKeys={new Set(selectedCategories)}
              onSelectionChange={(keys) => onCategoriesChange(Array.from(keys as Set<Key>))}
            >
              <Label>{t('Transactions.filters.categories')}</Label>
              <TagGroup.List items={categories} renderEmptyState={() => null}>
                {(category) => (
                  <Tag id={category.id.toString()} textValue={category.name}>
                    {AVAILABLE_ICONS.has(category.iconName) &&
                      React.createElement(AVAILABLE_ICONS.get(category.iconName)!, {
                        className: 'size-4 mr-1',
                        color: category.color ?? undefined,
                      })}
                    {trySystemTranslations(category.name)}
                  </Tag>
                )}
              </TagGroup.List>
            </TagGroup>

            {availableSubcategories.length > 0 && (
              <TagGroup
                selectionMode="multiple"
                selectedKeys={new Set(selectedSubcategories)}
                onSelectionChange={(keys) => onSubcategoriesChange(Array.from(keys as Set<Key>))}
              >
                <Label>{t('Transactions.filters.subcategories')}</Label>
                <TagGroup.List items={availableSubcategories}>
                  {(subcategory) => (
                    <Tag id={subcategory.id.toString()} textValue={trySystemTranslations(subcategory.name)}>
                      {trySystemTranslations(subcategory.name)}
                    </Tag>
                  )}
                </TagGroup.List>
              </TagGroup>
            )}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
};
