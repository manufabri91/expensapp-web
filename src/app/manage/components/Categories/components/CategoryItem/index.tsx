'use client';

import React, { Suspense, useState } from 'react';
import { SubcategoriesList } from '@/app/manage/components/Categories/components/SubcategoriesList';
import { AVAILABLE_ICONS } from '@/components/IconPicker/constants';
import { CategoryResponse } from '@/types/dto';
import { DeleteCategoryButton, EditCategoryButton } from '../CategoryActions';

interface CategoryItemProps {
  category: CategoryResponse;
}

export const CategoryItem = ({ category }: CategoryItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = AVAILABLE_ICONS.get(category.iconName) ?? React.Fragment;

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="flex flex-col" onClick={toggleExpanded}>
      <div className="flex justify-between p-4">
        <div className="flex items-center gap-2">
          <Icon className="mr-1 size-6" color={category.color ?? undefined} />
          {category.name}
        </div>
        <div className="flex gap-2">
          <EditCategoryButton category={category} />
          <DeleteCategoryButton categoryId={category.id} />
        </div>
      </div>

      {expanded && (
        <Suspense>
          <SubcategoriesList parentCategoryId={category.id} key={category.id} />
        </Suspense>
      )}
    </div>
  );
};
