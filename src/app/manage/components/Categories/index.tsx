import React from 'react';
import { Suspense } from 'react';
import { Accordion, AccordionContent, AccordionPanel, AccordionTitle } from 'flowbite-react';

import { getCategories } from '@/lib/actions/categories';

import { CreateCategoryButton, EditCategoryButton } from './components/CategoryActions';
import { SubcategoriesList } from './components/SubcategoriesList';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';

export const Categories = async () => {
  const categories = await getCategories();
  return (
    <div className="flex flex-col gap-8 overflow-x-auto">
      <h3 className="my-8 text-xl font-semibold text-gray-800 dark:text-gray-100 md:mt-16">Categories</h3>
      <Suspense
        fallback={
          <div className="flex h-16 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
            <span>Loading categories...</span>
          </div>
        }
      >
        <CreateCategoryButton />
        <Accordion collapseAll>
          {categories.map((category) => {
            const Icon = AVAILABLE_ICONS.get(category.iconName) ?? React.Fragment;
            return (
              <AccordionPanel key={category.id}>
                <AccordionTitle>
                  <span className="flex gap-2">
                    <Icon className="mr-2 size-6" />
                    {category.name}
                    <EditCategoryButton category={category} />
                  </span>
                </AccordionTitle>
                <AccordionContent>
                  <SubcategoriesList parentCategoryId={category.id} key={category.id} />
                </AccordionContent>
              </AccordionPanel>
            );
          })}
        </Accordion>
      </Suspense>
    </div>
  );
};
