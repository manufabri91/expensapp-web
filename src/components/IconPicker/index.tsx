'use client';
import { Dropdown, DropdownItem, DropdownTrigger } from '@heroui/dropdown';
import { Input } from '@heroui/input';
import { useTranslations } from 'next-intl';
import React, { FC, useState } from 'react';

import { Icon } from '@/types/enums/icon';
import { AVAILABLE_ICONS } from './constants';

export const IconPicker: React.FC<{ value: Icon; onChange: (icon: Icon) => void }> = ({ value, onChange }) => {
  const t = useTranslations('IconPicker');
  const handleSelect = (iconName: Icon) => {
    onChange(iconName);
  };

  const SelectedIcon = AVAILABLE_ICONS.get(value) || null;

  return (
    <>
      <Dropdown>
        <DropdownTrigger>{SelectedIcon ? <SelectedIcon /> : t('noIcon')}</DropdownTrigger>
        <DropdownItem key={Icon.NONE} onClick={() => handleSelect(Icon.NONE)}>
          <div className="flex items-center space-x-2">
            <span>{t('noIcon')}</span>
          </div>
        </DropdownItem>
        {AVAILABLE_ICONS.entries()
          .toArray()
          .map(([name, Icon]) => (
            <DropdownItem key={name} onClick={() => handleSelect(name)}>
              <div className="flex items-center space-x-2">
                <Icon className="size-5" />
                <span>{name}</span>
              </div>
            </DropdownItem>
          ))}
      </Dropdown>
    </>
  );
};

interface Props {
  id?: string;
  name?: string;
  initialValue?: Icon;
}

export const IconPickerFormField: FC<Props> = ({ id, name = 'iconName', initialValue = Icon.NONE }) => {
  const [selectedIcon, setSelectedIcon] = useState<Icon>(initialValue);

  return (
    <div className="min-w-max">
      <IconPicker value={selectedIcon} onChange={setSelectedIcon} />
      <Input type="hidden" id={id ?? name} name={name} value={selectedIcon} />
    </div>
  );
};
