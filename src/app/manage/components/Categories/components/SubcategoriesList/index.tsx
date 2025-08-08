import {
  CreateSubcategoryButton,
  DeleteSubcategoryButton,
  EditSubcategoryButton,
} from '@/app/manage/components/Categories/components/SubcategoryActions';
import { getSubcategoriesByParentCategoryId } from '@/lib/actions/subcategories';
import { Suspense } from 'react';

interface Props {
  parentCategoryId: number;
}

export const SubcategoriesList = async ({ parentCategoryId }: Props) => {
  const subcategories = await getSubcategoriesByParentCategoryId(parentCategoryId);

  return (
    <Suspense fallback={<div className="size-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />}>
      <CreateSubcategoryButton parentCategoryId={parentCategoryId} />
      {subcategories.map((subcategory, idx) => (
        <div
          key={subcategory.id}
          className={`${idx < subcategories.length - 1 ? 'border-b dark:border-slate-600' : ''}`}
        >
          <div className="my-4 flex items-center justify-between">
            {subcategory.name}
            <div className="flex gap-2">
              <EditSubcategoryButton subcategory={subcategory} />
              <DeleteSubcategoryButton subcategoryId={subcategory.id} />
            </div>
          </div>
        </div>
      ))}
    </Suspense>
  );
};
