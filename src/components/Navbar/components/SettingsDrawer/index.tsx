'use client';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/drawer';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSelector } from './ThemeSelector';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: Props) {
  const t = useTranslations('Settings');
  return (
    <Drawer isOpen={open} onOpenChange={onClose}>
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader>{t('title')}</DrawerHeader>
            <DrawerBody>
              <LocaleSwitcher type="select" />
              <ThemeSelector />
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
