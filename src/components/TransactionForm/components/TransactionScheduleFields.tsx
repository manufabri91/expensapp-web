import {
  Checkbox,
  CheckboxGroup,
  ErrorMessage,
  FieldError,
  InputGroup,
  Label,
  NumberField,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { TransactionMode } from '@/components/TransactionModeSelector';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionDatePicker } from './TransactionDatePicker';
import { TransactionFormValues } from '../types';

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) => index + 1);
export const TransactionScheduleFields = ({ mode }: { mode: TransactionMode }) => {
  const t = useTranslations();
  const { control, setValue } = useFormContext<TransactionFormValues>();
  const [watchedFrequency, watchedHasEndDate, watchedDaysOfMonth] = useWatch({
    control,
    name: ['frequency', 'hasEndDate', 'daysOfMonth'],
  });
  return (
    <>
      {' '}
      {mode === 'oneTime' && (
        <Controller
          control={control}
          name="eventDate"
          render={({ field }) => (
            <TransactionDatePicker label={t('Generics.date')} value={field.value} onChange={field.onChange} />
          )}
        />
      )}
      {mode === 'recurring' && (
        <>
          <Controller
            control={control}
            name="frequency"
            render={({ field }) => (
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as RecurrenceFrequency | undefined;
                  if (next) field.onChange(next);
                }}
              >
                <ToggleButton id={RecurrenceFrequency.INTERVAL_DAYS}>
                  {t('TransactionForm.frequency.intervalDays')}
                </ToggleButton>
                <ToggleButton id={RecurrenceFrequency.MONTHLY_DAYS}>
                  {t('TransactionForm.frequency.monthlyDays')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />

          {watchedFrequency === RecurrenceFrequency.INTERVAL_DAYS && (
            <Controller
              control={control}
              name="intervalDays"
              render={({ field, fieldState }) => (
                <NumberField
                  minValue={1}
                  fullWidth
                  isRequired
                  variant="secondary"
                  isInvalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <Label>{t('TransactionForm.intervalDaysLabel')}</Label>
                  <InputGroup variant="secondary" fullWidth>
                    <InputGroup.Input ref={field.ref} />
                  </InputGroup>
                  {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                </NumberField>
              )}
            />
          )}

          {watchedFrequency === RecurrenceFrequency.MONTHLY_DAYS && (
            <Controller
              control={control}
              name="daysOfMonth"
              render={({ field, fieldState }) => (
                <>
                  <CheckboxGroup
                    value={(watchedDaysOfMonth ?? [])
                      .slice()
                      .sort((a, b) => a - b)
                      .map(String)}
                    onChange={(keys: string[]) => field.onChange(keys.map(Number))}
                  >
                    <Label>{t('TransactionForm.daysOfMonthLabel')}</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_MONTH.map((day) => (
                        <Checkbox key={day} value={day.toString()}>
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            <span>{day}</span>
                          </Checkbox.Content>
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>
                  {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                </>
              )}
            />
          )}

          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <TransactionDatePicker
                label={t('TransactionForm.startDate')}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Switch
            size="sm"
            isSelected={!watchedHasEndDate}
            onChange={(selected: boolean) => setValue('hasEndDate', !selected, { shouldDirty: true })}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <span>{t('TransactionForm.noEndDate')}</span>
            </Switch.Content>
          </Switch>

          {watchedHasEndDate && (
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <TransactionDatePicker
                    label={t('TransactionForm.endDate')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                </div>
              )}
            />
          )}
        </>
      )}
    </>
  );
};
