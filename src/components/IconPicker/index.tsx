'use client';
import { Label, ListBox, Select } from '@heroui/react';
import React, { FC } from 'react';

import { useTranslations } from 'use-intl';
import { AVAILABLE_ICONS } from '@/components/Icon';
import { Icon } from '@/types/enums/icon';

interface Props {
  id?: string;
  name?: string;
  label?: string;
  initialValue?: Icon;
  selectedKey?: Icon;
  onSelectionChange?: (icon: Icon) => void;
  isInvalid?: boolean;
}

export const IconPickerFormField: FC<Props> = ({
  id,
  name = 'iconName',
  initialValue = Icon.NONE,
  label,
  selectedKey,
  onSelectionChange,
  isInvalid,
}) => {
  const t = useTranslations('IconPicker');
  const iconItems = AVAILABLE_ICONS.entries()
    .toArray()
    .map(([iconName, IconComponent]) => ({
      key: iconName,
      IconComponent,
      label: iconName,
    }));

  const isControlled = selectedKey !== undefined;

  return (
    <Select
      placeholder=""
      fullWidth
      id={id ?? name}
      name={name}
      isInvalid={isInvalid}
      {...(isControlled
        ? { selectedKey, onSelectionChange: (key: React.Key | null) => onSelectionChange?.((key ?? Icon.NONE) as Icon) }
        : { defaultSelectedKey: initialValue })}
      variant="secondary"
    >
      <Label>{label ?? t('icon')}</Label>
      <Select.Trigger>
        <Select.Value>
          {({ selectedItem }) => {
            if (!selectedItem) return null;
            const iconEntry = iconItems.find((item) => item.key === selectedItem);
            if (!iconEntry) return null;
            return (
              <div className="flex items-center gap-2">
                <iconEntry.IconComponent className="size-5" />
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
              <IconComponent className="size-5 self-center" />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
