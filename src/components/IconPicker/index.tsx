'use client';
import { Label, ListBox, Select } from '@heroui/react';
import React, { FC } from 'react';

import { useTranslations } from 'use-intl';
import { Icon } from '@/types/enums/icon';
import { AVAILABLE_ICONS } from './constants';

interface Props {
  id?: string;
  name?: string;
  label?: string;
  initialValue?: Icon;
}

export const IconPickerFormField: FC<Props> = ({ id, name = 'iconName', initialValue = Icon.NONE, label }) => {
  const t = useTranslations('IconPicker');
  const iconItems = AVAILABLE_ICONS.entries()
    .toArray()
    .map(([iconName, IconComponent]) => ({
      key: iconName,
      IconComponent,
      label: iconName,
    }));

  return (
    <Select
      placeholder={t('noIcon')}
      fullWidth
      id={id ?? name}
      name={name}
      defaultSelectedKey={initialValue}
      variant="secondary"
    >
      <Label>{label ?? 'Icon'}</Label>
      <Select.Trigger>
        <Select.Value>
          {({ selectedItem }) => {
            if (!selectedItem) return null;
            const iconEntry = iconItems.find((item) => item.key === selectedItem);
            if (!iconEntry) return null;
            return (
              <div className="flex items-center gap-2">
                <iconEntry.IconComponent className="size-5" />
                <span>{iconEntry.label}</span>
              </div>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {iconItems.map(({ key, IconComponent, label: iconLabel }) => (
            <ListBox.Item key={key} id={key} textValue={iconLabel}>
              <div className="flex items-center gap-2">
                <IconComponent className="size-5" />
                <span>{iconLabel}</span>
              </div>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
