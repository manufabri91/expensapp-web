import React from 'react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle, Spinner } from 'flowbite-react';

import { getCategories } from '@/lib/actions/categories';

import { CreateCategoryButton, EditCategoryButton } from './components/CategoryActions';
import { SubcategoriesList } from './components/SubcategoriesList';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';

export const Categories = async () => {
  const categories = await getCategories();
  return (
    <>
      <h3 className="my-4 mt-8 text-xl font-semibold text-gray-800 dark:text-gray-100">Categories</h3>
      <CreateCategoryButton />
      <Suspense
        fallback={
          <Accordion collapseAll className="mt-4">
            <AccordionPanel>
              <AccordionTitle>
                <Spinner className="mr-2" />
                Loading categories...
              </AccordionTitle>
            </AccordionPanel>
          </Accordion>
        }
      >
        <Accordion collapseAll className="mt-4">
          {categories.map((category) => {
            const Icon = AVAILABLE_ICONS.get(category.iconName) ?? React.Fragment;
            return (
              <AccordionPanel key={category.id}>
                <AccordionTitle>
                  <span className="flex items-center gap-2">
                    <Icon className="mr-1 size-6" color={category.color ?? undefined} />
                    {category.name}
                  </span>
                </AccordionTitle>
                <AccordionContent>
                  <div className="flex items-center justify-end">
                    <EditCategoryButton category={category} />
                  </div>
                  <SubcategoriesList parentCategoryId={category.id} key={category.id} />
                </AccordionContent>
              </AccordionPanel>
            );
          })}
        </Accordion>
      </Suspense>
    </>
  );
};
