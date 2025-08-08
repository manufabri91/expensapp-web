'use client';

import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { CategoryResponse } from '@/types/dto';
import { useState } from 'react';
import { deleteCategoryById } from '@/lib/actions/categories';
import { Spinner } from 'flowbite-react';

export const CreateCategoryButton = () => {
  const { showCategoryForm } = useCategoryForm();
  const handleClick = () => {
    showCategoryForm();
  };

  return (
    <Button variant={ButtonVariant.Primary} onClick={handleClick}>
      <HiPlus className="mr-1 size-5" />
      Add Category
    </Button>
  );
};

export const EditCategoryButton = ({ category }: { category: CategoryResponse }) => {
  const { showCategoryForm } = useCategoryForm();
  const handleClick = () => {
    showCategoryForm(category);
  };
  return (
    <Button variant={ButtonVariant.Secondary} onClick={handleClick}>
      <HiPencil className="mr-1 size-5" />

      <span className="hidden md:block">Edit</span>
    </Button>
  );
};

export const DeleteCategoryButton = ({ categoryId }: { categoryId: number }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    setIsDeleting(true);
    await deleteCategoryById(categoryId);
    setIsDeleting(false);
  };

  return (
    <Button variant={ButtonVariant.Critical} onClick={deleteHandler} disabled={isDeleting}>
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      {isDeleting && <Spinner className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? 'Deleting...' : 'Delete'}</span>
    </Button>
  );
};
