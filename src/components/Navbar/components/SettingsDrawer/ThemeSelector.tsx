'use client';
import { Label, ListBox, Select } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Key } from 'react';
import { HiComputerDesktop, HiMoon, HiSun } from 'react-icons/hi2';

const THEMES = ['system', 'light', 'dark'] as const;

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('System.themeSelector');

  const onThemeModeChange = (key: Key | null) => {
    if (key) {
      setTheme(key as string);
    }
  };

  const themeLabelMap = {
    system: {
      icon: HiComputerDesktop,
      label: t('systemMode'),
    },
    light: {
      icon: HiSun,
      label: t('lightMode'),
    },
    dark: {
      icon: HiMoon,
      label: t('darkMode'),
    },
  };

  const themeItems = THEMES.map((theme) => ({
    key: theme,
    label: themeLabelMap[theme].label,
    Icon: themeLabelMap[theme].icon,
  }));

  return (
    <Select
      name="theme"
      defaultSelectedKey={theme || 'system'}
      onSelectionChange={onThemeModeChange}
      variant="secondary"
    >
      <Label>{t('label')}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {themeItems.map(({ key, label, Icon }) => (
            <ListBox.Item id={key} key={key} textValue={label}>
              <Icon /> {label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};
