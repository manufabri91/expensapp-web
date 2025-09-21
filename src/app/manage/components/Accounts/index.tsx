import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';
import { AccountActions } from '@/app/manage/components/Accounts/components/AccountActions';
import { AccountsDetails } from '@/app/manage/components/Accounts/components/AccountsDetails';
import { CardSkeleton } from '@/components';

export const Accounts = async () => {
  const t = await getTranslations('Manage.accounts');
  return (
    <>
      <div className="mt-10 flex items-baseline gap-4 md:mt-14">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h3>
        <AccountActions />
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <AccountsDetails />
      </Suspense>
      <div />
    </>
  );
};
