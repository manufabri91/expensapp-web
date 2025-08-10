import React from 'react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Spinner } from 'flowbite-react';
import { getTranslations } from 'next-intl/server';

import { getCategories } from '@/lib/actions/categories';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { TypeBadge } from '@/components/TypeBadge';

import { CreateCategoryButton, DeleteCategoryButton, EditCategoryButton } from './components/CategoryActions';
import { SubcategoriesList } from './components/SubcategoriesList';

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
          <Accordion collapseAll className="mt-4">
            <AccordionPanel>
              <AccordionTitle>
                <Spinner className="mr-2" />
                {t('loading')}
              </AccordionTitle>
            </AccordionPanel>
          </Accordion>
        }
      >
        <div className="mt-4 flex flex-col gap-4">
          {categories
            .filter(({ readOnly }) => !readOnly)
            .map((category) => {
              const Icon = AVAILABLE_ICONS.get(category.iconName) ?? React.Fragment;
              return (
                <div
                  key={category.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="mr-1 size-6" color={category.color ?? undefined} />
                      <span className="font-medium">{category.name}</span>
                      <div className="hidden md:block">
                        <TypeBadge size="xs" type={category.type} />
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <EditCategoryButton category={category} />
                      <DeleteCategoryButton categoryId={category.id} />
                    </div>
                  </div>
                  <Accordion collapseAll>
                    <AccordionPanel>
                      <AccordionTitle>{t('subcategoriesTitle')}</AccordionTitle>
                      <AccordionContent>
                        <SubcategoriesList parentCategoryId={category.id} key={category.id} />
                      </AccordionContent>
                    </AccordionPanel>
                  </Accordion>
                </div>
              );
            })}
        </div>
      </Suspense>
    </>
  );
};
