import { Calendar, DateField, DatePicker, Label } from '@heroui/react';
import { fromDate, getLocalTimeZone } from '@internationalized/date';

interface TransactionDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
}

export const TransactionDatePicker = ({ label, value, onChange }: TransactionDatePickerProps) => (
  <DatePicker
    granularity="day"
    value={fromDate(value ?? new Date(), getLocalTimeZone())}
    onChange={(date: { toDate: () => Date } | null) => onChange(date?.toDate() ?? new Date())}
    isRequired
  >
    <Label>{label}</Label>
    <DateField.Group fullWidth variant="secondary">
      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      <DateField.Suffix>
        <DatePicker.Trigger>
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
    <DatePicker.Popover>
      <Calendar aria-label={label}>
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>{(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody>
            {({ year }) => <Calendar.YearPickerCell year={year} />}
          </Calendar.YearPickerGridBody>
        </Calendar.YearPickerGrid>
      </Calendar>
    </DatePicker.Popover>
  </DatePicker>
);
