import { getSubcategoriesByParentCategoryId } from '@/lib/actions/subcategories';
import { Suspense } from 'react';

interface Props {
  parentCategoryId: number;
}

export const SubcategoriesList = async ({ parentCategoryId }: Props) => {
  const subcategories = await getSubcategoriesByParentCategoryId(parentCategoryId);
  return (
    <div className="mt-4 overflow-x-auto">
      <Suspense fallback={<div className="size-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />}>
        <ul>
          {subcategories.map((subcategory) => (
            <li key={subcategory.id} className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-gray-100">{subcategory.name}</span>
            </li>
          ))}
        </ul>
      </Suspense>
    </div>
  );
};
