import { AccountActions } from '@/app/manage/components/Accounts/components/AccountActions';
import { AccountsDetails } from '@/app/manage/components/Accounts/components/AccountsDetails';
import { CardSkeleton } from '@/components';
import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';

export const Accounts = async () => {
  const t = await getTranslations('Manage.accounts');
  return (
    <>
      <div className="flex items-baseline gap-4">
        <h3 className="my-4 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">{t('title')}</h3>
        <AccountActions />
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <AccountsDetails />
      </Suspense>
      <div />
    </>
  );
};
