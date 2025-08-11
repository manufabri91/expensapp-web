'use client';

import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, ButtonVariant, ToastType } from '@/components';
import { SubCategoryResponse } from '@/types/dto';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { useState } from 'react';
import { deleteSubcategoryById } from '@/lib/actions/subcategories';
import { Spinner } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { useToaster } from '@/components/Toast/ToastProvider';

interface CreateSubcategoryButtonProps {
  parentCategoryId: number;
  className?: string;
}

export const CreateSubcategoryButton = ({ parentCategoryId, className }: CreateSubcategoryButtonProps) => {
  const t = useTranslations('Generics');
  const { showSubcategoryCreateForm } = useSubcategoryForm();
  return (
    <Button
      variant={ButtonVariant.Primary}
      onClick={() => {
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
      variant={ButtonVariant.Secondary}
      onClick={() => {
        showSubcategoryEditForm(subcategory);
      }}
    >
      {!isOpen && <HiPencil className="mr-1 size-5" />}
      {isOpen && <Spinner className="mr-1 size-5" />}
      <span className="hidden md:block">{isOpen ? `${t('editing')}...` : t('edit')}</span>
    </Button>
  );
};

export const DeleteSubcategoryButton = ({ subcategoryId }: { subcategoryId: number }) => {
  const t = useTranslations();
  const { showToast } = useToaster();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    setIsDeleting(true);
    try {
      await deleteSubcategoryById(subcategoryId);
      showToast(t('SubcategoryForm.deletedSuccess', { id: subcategoryId }), ToastType.Success);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, ToastType.Error);
      } else {
        showToast(t('SubcategoryForm.unexpectedError'), ToastType.Error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant={ButtonVariant.Critical}
      onClick={() => {
        deleteHandler();
      }}
      disabled={isDeleting}
    >
      {!isDeleting && <HiTrash className="mr-1 size-5" />}
      {isDeleting && <Spinner className="mr-1 size-5" />}
      <span className="hidden md:block">{isDeleting ? `${t('Generics.deleting')}...` : t('Generics.delete')}</span>
    </Button>
  );
};
