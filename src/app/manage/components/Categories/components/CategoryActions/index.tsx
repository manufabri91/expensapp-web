'use client';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';
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
      <Button size="sm" color="primary" onPress={handleClick}>
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
    <Button size="sm" color="secondary" onPress={handleClick}>
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
      addToast({ title: t('CategoryForm.deletedSuccess', { id: categoryId }), color: 'success' });
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('CategoryForm.unexpectedError'), color: 'danger' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" color="danger" onPress={deleteHandler} disabled={isDeleting}>
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      {isDeleting && <Spinner className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? `${t('Generics.deleting')}...` : t('Generics.delete')}</span>
    </Button>
  );
};
