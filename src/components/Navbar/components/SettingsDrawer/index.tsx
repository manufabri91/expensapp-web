'use client';
import { Drawer, Separator, type UseOverlayStateReturn } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { DeleteAccountButton } from './DeleteAccountButton';
import { ExportDataLink } from './ExportDataLink';
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
          <Drawer.Body className="flex flex-col gap-4">
            <LocaleSwitcher type="select" />
            <ThemeSelector />
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex w-full flex-col justify-center gap-4">
              <ExportDataLink />
              <DeleteAccountButton />
            </div>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
