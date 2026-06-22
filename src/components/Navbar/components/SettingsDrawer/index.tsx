'use client';
import { Drawer, type UseOverlayStateReturn } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSelector } from './ThemeSelector';

interface Props {
  state: UseOverlayStateReturn;
}

export function SettingsDrawer({ state }: Props) {
  const t = useTranslations('Settings');
  return (
    <Drawer.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Drawer.Content placement="right">
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>{t('title')}</Drawer.Heading>
          </Drawer.Header>
          <Drawer.Body>
            <LocaleSwitcher type="select" />
            <ThemeSelector />
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
