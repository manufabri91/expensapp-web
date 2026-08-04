import { Card, Spinner } from '@heroui/react';
import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';

import { CategoriesDetails } from '@/app/manage/components/Categories/components/CategoriesDetails';

import { CreateCategoryButton } from './components/CategoryActions';

export const Categories = async () => {
  const t = await getTranslations('Manage.categories');

  return (
    <>
      <div className="mt-10 mb-6 flex items-baseline gap-4 md:mt-14">
        <h3 className="self-center text-xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h3>
        <CreateCategoryButton />
      </div>
      <Suspense
        fallback={
          <Card>
            <Card.Content className="flex flex-col items-center justify-center gap-2">
              <Spinner className="mr-2" />
              {t('loading')}
            </Card.Content>
          </Card>
        }
      >
        <CategoriesDetails />
      </Suspense>
    </>
  );
};
