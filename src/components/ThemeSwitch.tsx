'use client';

import { Button } from '@heroui/button';
import { useIsSSR } from '@react-aria/ssr';
import { useTheme } from 'next-themes';
import { FC } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi2';

export const ThemeSwitch: FC = () => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <Button variant="light" isIconOnly onPress={onChange}>
      {theme === 'dark' || isSSR ? <HiSun size={22} /> : <HiMoon size={22} />}
    </Button>
  );
};
