'use client';

import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { CategoryResponse } from '@/types/dto';
import { useState } from 'react';
import { deleteCategoryById } from '@/lib/actions/categories';
import { Spinner } from 'flowbite-react';
import { useTranslations } from 'next-intl';

export const CreateCategoryButton = () => {
  const t = useTranslations('Generics');
  const { showCategoryForm } = useCategoryForm();
  const handleClick = () => {
    showCategoryForm();
  };

  return (
    <div>
      <Button variant={ButtonVariant.Primary} onClick={handleClick}>
        <HiPlus className="mr-1 size-5" />
        {t('new.female')}
      </Button>
    </div>
  );
};

export const EditCategoryButton = ({ category }: { category: CategoryResponse }) => {
  const t = useTranslations('Generics');
  const { showCategoryForm } = useCategoryForm();
  const handleClick = () => {
    showCategoryForm(category);
  };
  return (
    <Button variant={ButtonVariant.Secondary} onClick={handleClick}>
      <HiPencil className="mr-1 size-5" />

      <span className="hidden md:block">{t('edit')}</span>
    </Button>
  );
};

export const DeleteCategoryButton = ({ categoryId }: { categoryId: number }) => {
  const t = useTranslations('Generics');
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
      <span className="hidden md:block">{isDeleting ? `${t('deleting')}...` : t('delete')}</span>
    </Button>
  );
};
