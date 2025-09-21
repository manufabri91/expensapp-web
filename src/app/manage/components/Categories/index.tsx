import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';

import { CategoriesAccordion } from '@/app/manage/components/Categories/components/CategoriesAccordion';
import { getCategories } from '@/lib/actions/categories';

import { CreateCategoryButton } from './components/CategoryActions';

export const Categories = async () => {
  const categories = await getCategories();
  const t = await getTranslations('Manage.categories');

  return (
    <>
      <div className="mt-10 flex items-baseline gap-4 md:mt-14">
        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h3>
        <CreateCategoryButton />
      </div>
      <Suspense
        fallback={
          <Card>
            <CardBody className="flex flex-col items-center justify-center gap-2">
              <Spinner className="mr-2" />
              {t('loading')}
            </CardBody>
          </Card>
        }
      >
        <CategoriesAccordion categories={categories} />
      </Suspense>
    </>
  );
};
