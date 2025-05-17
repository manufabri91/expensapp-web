'use client';
import React, { FC, useState } from 'react';
import { Dropdown, TextInput } from 'flowbite-react';

import { AVAILABLE_ICONS } from './constants';
import { Icon } from '@/types/enums/icon';

export const IconPicker: React.FC<{ value: Icon; onChange: (icon: Icon) => void }> = ({ value, onChange }) => {
  const handleSelect = (iconName: Icon) => {
    onChange(iconName);
  };

  const SelectedIcon = AVAILABLE_ICONS.get(value) || null;

  return (
    <>
      <Dropdown label={SelectedIcon ? <SelectedIcon /> : 'No icon'} inline>
        <Dropdown.Item onClick={() => handleSelect(Icon.NONE)}>
          <div className="flex items-center space-x-2">
            <span>No icon</span>
          </div>
        </Dropdown.Item>
        {AVAILABLE_ICONS.entries()
          .toArray()
          .map(([name, Icon]) => (
            <Dropdown.Item key={name} onClick={() => handleSelect(name)}>
              <div className="flex items-center space-x-2">
                <Icon className="size-5" />
                <span>{name}</span>
              </div>
            </Dropdown.Item>
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
      <TextInput type="hidden" id={id ?? name} name={name} value={selectedIcon} />
    </div>
  );
};
