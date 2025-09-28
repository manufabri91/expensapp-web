'use client';

import { addToast } from '@heroui/toast';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button } from '@/components';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { deleteSubcategoryById } from '@/lib/actions/subcategories';
import { SubCategoryResponse } from '@/types/dto';

interface CreateSubcategoryButtonProps {
  parentCategoryId: number;
  className?: string;
}

export const CreateSubcategoryButton = ({ parentCategoryId, className }: CreateSubcategoryButtonProps) => {
  const t = useTranslations('Generics');
  const { showSubcategoryCreateForm } = useSubcategoryForm();
  return (
    <Button
      color="primary"
      size="sm"
      onPress={() => {
        showSubcategoryCreateForm(parentCategoryId);
      }}
      className={className}
    >
      <HiPlus className="mr-1 size-5" />
      {t('new.female')}
    </Button>
  );
};

export const EditSubcategoryButton = ({ subcategory }: { subcategory: SubCategoryResponse }) => {
  const t = useTranslations('Generics');
  const { showSubcategoryEditForm, isOpen } = useSubcategoryForm();
  return (
    <Button
      color="secondary"
      size="sm"
      isLoading={isOpen}
      isDisabled={isOpen}
      onPress={() => {
        showSubcategoryEditForm(subcategory);
      }}
    >
      {!isOpen && <HiPencil className="mr-1 size-5" />}
      <span className="hidden md:block">{isOpen ? `${t('editing')}...` : t('edit')}</span>
    </Button>
  );
};

export const DeleteSubcategoryButton = ({ subcategoryId }: { subcategoryId: number }) => {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    setIsDeleting(true);
    try {
      await deleteSubcategoryById(subcategoryId);
      addToast({ title: t('SubcategoryForm.deletedSuccess', { id: subcategoryId }), color: 'primary' });
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('SubcategoryForm.unexpectedError'), color: 'danger' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      color="danger"
      size="sm"
      onPress={() => {
        deleteHandler();
      }}
      isDisabled={isDeleting}
      isLoading={isDeleting}
    >
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? `${t('Generics.deleting')}...` : t('Generics.delete')}</span>
    </Button>
  );
};
