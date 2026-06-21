'use client';
import { Avatar, Label, ListBox, Select } from '@heroui/react';
import { Key } from 'react';
import { setUserLocale } from '@/services/locale';
type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string; code: string }>;
  label: string;
};

const Flag = ({ code }: { code: string }) => (
  <Avatar size="sm">
    <Avatar.Image src={`/images/flags/${code.toUpperCase()}.png`} />
  </Avatar>
);

export default function LocaleSwitcherSelect({ defaultValue, items, label }: Props) {
  const setLocale = (key: Key | null) => {
    if (key) {
      setUserLocale(key as 'en' | 'es' | 'es-AR');
    }
  };

  return (
    <Select name="locale" defaultSelectedKey={defaultValue} onSelectionChange={setLocale} variant="secondary">
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map(({ value, label, code }) => (
            <ListBox.Item id={value} key={value} textValue={label}>
              <Flag code={code} /> {label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
