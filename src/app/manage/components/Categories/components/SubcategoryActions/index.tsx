'use client';

import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, ButtonVariant } from '@/components';
import { SubCategoryResponse } from '@/types/dto';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { useState } from 'react';
import { deleteSubcategoryById } from '@/lib/actions/subcategories';
import { Spinner } from 'flowbite-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Generics');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandler = async () => {
    setIsDeleting(true);
    await deleteSubcategoryById(subcategoryId);
    setIsDeleting(false);
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
      <span className="hidden md:block">{isDeleting ? `${t('deleting')}...` : t('delete')}</span>
    </Button>
  );
};
