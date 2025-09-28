'use client';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/drawer';
import { Select, SelectItem } from '@heroui/select';
import { useTheme } from 'next-themes';
import { ChangeEvent } from 'react';
import { HiComputerDesktop, HiMiniPaintBrush, HiMoon, HiSun } from 'react-icons/hi2';

const THEMES = ['system', 'light', 'dark'] as const;

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const onThemeModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value;
    setTheme(mode);
  };

  const themeLabelMap = {
    system: {
      icon: HiComputerDesktop,
      label: 'System',
    },
    light: {
      icon: HiSun,
      label: 'Light',
    },
    dark: {
      icon: HiMoon,
      label: 'Dark',
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
      label="Theme Mode"
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

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: Props) {
  return (
    <Drawer isOpen={open} onOpenChange={onClose}>
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader>Settings</DrawerHeader>
            <DrawerBody>
              <ThemeSelector />
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
