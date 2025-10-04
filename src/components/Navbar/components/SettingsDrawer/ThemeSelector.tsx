'use client';
import { Select, SelectItem } from '@heroui/select';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { ChangeEvent } from 'react';
import { HiComputerDesktop, HiMiniPaintBrush, HiMoon, HiSun } from 'react-icons/hi2';

const THEMES = ['system', 'light', 'dark'] as const;

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('System.themeSelector');

  const onThemeModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    setTheme(mode);
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
      labelPlacement="outside"
      selectedKeys={[theme || 'system']}
      onChange={onThemeModeChange}
      label={t('label')}
      startContent={<HiMiniPaintBrush />}
      fullWidth
    >
      {themeItems.map(({ key, label, Icon }) => {
        return (
          <SelectItem key={key} startContent={<Icon />}>
            {label}
          </SelectItem>
        );
      })}
    </Select>
  );
};
