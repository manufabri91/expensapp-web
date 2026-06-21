'use client';

import { toast } from '@heroui/react';
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
      variant="primary"
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
  const { showSubcategoryEditForm, overlayState } = useSubcategoryForm();
  const isOpen = overlayState.isOpen;
  return (
    <Button
      variant="secondary"
      size="sm"
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
      toast(t('SubcategoryForm.deletedSuccess', { id: subcategoryId }));
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('SubcategoryForm.unexpectedError'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="danger"
      size="sm"
      onPress={() => {
        deleteHandler();
      }}
      isDisabled={isDeleting}
    >
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? `${t('Generics.deleting')}...` : t('Generics.delete')}</span>
    </Button>
  );
};
