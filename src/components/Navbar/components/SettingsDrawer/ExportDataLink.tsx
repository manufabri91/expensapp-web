'use client';
import { Link } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { HiArrowDownTray } from 'react-icons/hi2';

export const ExportDataLink = () => {
  const t = useTranslations('Settings');

  return (
    <Link href="/api/privacy/export" className="flex items-center gap-2">
      <HiArrowDownTray className="size-5" />
      {t('downloadMyData')}
    </Link>
  );
};
