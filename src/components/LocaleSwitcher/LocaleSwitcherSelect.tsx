'use client';
import { Avatar } from '@heroui/avatar';
import { Select, SelectItem } from '@heroui/select';
import { ChangeEvent } from 'react';
import { HiLanguage } from 'react-icons/hi2';
import { setUserLocale } from '@/services/locale';
type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string; code: string }>;
  label: string;
};

const Flag = ({ code }: { code: string }) => <Avatar src={`/images/flags/${code.toUpperCase()}.png`} size="sm" />;

export default function LocaleSwitcherSelect({ defaultValue, items, label }: Props) {
  const setLocale = (e: ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    setUserLocale(locale as 'en' | 'es' | 'es-AR');
  };

  return (
    <Select
      labelPlacement="outside"
      selectedKeys={[defaultValue]}
      onChange={setLocale}
      label={label}
      startContent={<HiLanguage />}
      fullWidth
    >
      {items.map(({ value, label, code }) => {
        return (
          <SelectItem key={value} startContent={<Flag code={code} />}>
            {label}
          </SelectItem>
        );
      })}
    </Select>
  );
}
