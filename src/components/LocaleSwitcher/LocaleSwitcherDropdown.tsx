'use client';

import { Dropdown } from '@heroui/react';
import { Key } from 'react';
import { HiLanguage } from 'react-icons/hi2';
import { setUserLocale } from '@/services/locale';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherDropdown({ defaultValue, items, label }: Props) {
  const setLocale = (locale: Key) => {
    setUserLocale(locale as 'en' | 'es' | 'es-AR');
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full p-2 text-foreground hover:bg-default/40 transition-colors"
      >
        <HiLanguage size={22} />
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu
          disallowEmptySelection
          aria-label={label}
          selectedKeys={[defaultValue]}
          selectionMode="single"
          onAction={setLocale}
        >
          {items.map((item) => (
            <Dropdown.Item id={item.value} key={item.value} textValue={item.label}>
              {item.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
