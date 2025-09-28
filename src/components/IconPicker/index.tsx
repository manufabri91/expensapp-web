'use client';
import { Select, SelectItem } from '@heroui/select';
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
    .map(([name, Icon]) => ({
      key: name,
      Icon,
      label: name,
    }));

  return (
    <Select
      label={label ?? 'Icon'}
      placeholder={t('noIcon')}
      labelPlacement="outside"
      fullWidth
      id={id ?? name}
      name={name}
      items={iconItems}
      defaultSelectedKeys={[initialValue]}
      renderValue={(items) => {
        return items.map(
          ({ key, data }) =>
            data && (
              <div key={key} className="flex items-center gap-2">
                {<data.Icon className="size-5" />}
                <span>{data.label}</span>
              </div>
            )
        );
      }}
    >
      {({ key, Icon, label }) => (
        <SelectItem key={key} startContent={<Icon className="size-5" />}>
          {label}
        </SelectItem>
      )}
    </Select>
  );
};
