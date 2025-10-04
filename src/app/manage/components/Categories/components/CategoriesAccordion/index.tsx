'use client';

import { Accordion, AccordionItem } from '@heroui/accordion';
import { FC, Fragment } from 'react';
import {
  DeleteCategoryButton,
  EditCategoryButton,
} from '@/app/manage/components/Categories/components/CategoryActions';
import { SubcategoriesList } from '@/app/manage/components/Categories/components/SubcategoriesList';
import { TypeBadge } from '@/components';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { CategoryResponse } from '@/types/dto';

type CategoriesAccordionProps = {
  categories: CategoryResponse[];
};

export const CategoriesAccordion: FC<CategoriesAccordionProps> = ({ categories }) => {
  return (
    <Accordion variant="splitted">
      {categories
        .filter(({ readOnly }) => !readOnly)
        .map((category) => {
          const Icon = AVAILABLE_ICONS.get(category.iconName) ?? Fragment;
          return (
            <AccordionItem
              key={category.id}
              aria-label={category.name}
              startContent={<Icon className="mr-1 size-6" color={category.color ?? undefined} />}
              title={
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{category.name}</h3>
                    <TypeBadge size="sm" type={category.type} />
                  </div>
                </div>
              }
            >
              <div className="flex items-center justify-start gap-2 self-end">
                <EditCategoryButton category={category} />
                <DeleteCategoryButton categoryId={category.id} />
              </div>
              <div className="mt-6 flex w-full flex-col">
                <SubcategoriesList parentCategoryId={category.id} />
              </div>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
};
