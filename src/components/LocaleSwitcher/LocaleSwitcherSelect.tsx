'use client';

import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Key } from '@react-types/shared';
import { HiLanguage } from 'react-icons/hi2';
import { setUserLocale } from '@/services/locale';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, items, label }: Props) {
  const setLocale = (locale: Key) => {
    setUserLocale(locale as 'en' | 'es' | 'es-AR');
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly aria-label={label}>
          <HiLanguage size={22} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label={label}
        selectedKeys={[defaultValue]}
        selectionMode="single"
        variant="flat"
        onAction={setLocale}
      >
        {items.map((item) => (
          <DropdownItem key={item.value}>{item.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
