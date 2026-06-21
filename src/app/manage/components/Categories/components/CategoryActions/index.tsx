'use client';
import { Spinner, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button } from '@/components';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { deleteCategoryById } from '@/lib/actions/categories';
import { CategoryResponse } from '@/types/dto';

export const CreateCategoryButton = () => {
  const t = useTranslations('Generics');
  const { showCategoryForm } = useCategoryForm();
  const handleClick = () => {
    showCategoryForm();
  };

  return (
    <div>
      <Button size="sm" variant="primary" onPress={handleClick}>
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
    <Button size="sm" variant="secondary" onPress={handleClick}>
      <HiPencil className="mr-1 size-5" />

      <span className="hidden md:block">{t('edit')}</span>
    </Button>
  );
};

export const DeleteCategoryButton = ({ categoryId }: { categoryId: number }) => {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const deleteHandler = async () => {
    setIsDeleting(true);

    try {
      await deleteCategoryById(categoryId);
      toast.success(t('CategoryForm.deletedSuccess', { id: categoryId }));
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('CategoryForm.unexpectedError'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" variant="danger" onPress={deleteHandler} isDisabled={isDeleting}>
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      {isDeleting && <Spinner className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? `${t('Generics.deleting')}...` : t('Generics.delete')}</span>
    </Button>
  );
};
