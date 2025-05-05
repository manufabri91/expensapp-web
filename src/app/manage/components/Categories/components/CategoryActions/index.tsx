'use client';

import { HiPencil, HiPlus } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { CategoryResponse } from '@/types/dto';

export const CreateCategoryButton = () => {
  const { showCategoryForm } = useCategoryForm();
  return (
    <Button
      variant={ButtonVariant.Primary}
      onClick={() => {
        showCategoryForm();
      }}
    >
      <HiPlus className="mr-1 size-5" />
      New Category
    </Button>
  );
};

export const EditCategoryButton = ({ category }: { category: CategoryResponse }) => {
  const { showCategoryForm } = useCategoryForm();
  return (
    <Button
      variant={ButtonVariant.Primary}
      onClick={() => {
        showCategoryForm(category);
      }}
    >
      <HiPencil className="mr-1 size-5" />
      Edit Category
    </Button>
  );
};
