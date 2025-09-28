'use client';

import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { addToast } from '@heroui/toast';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createSubcategory, editSubcategory } from '@/lib/actions/subcategories';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { SubCategoryResponse } from '@/types/dto';

export const SubcategoryForm = () => {
  const t = useTranslations();
  const trySystemTranslation = useTrySystemTranslations();
  const { subcategoryFormData, clearForm, isOpen, onOpenChange } = useSubcategoryForm();

  const { categories, addSubcategory } = useCategories();
  const [createdSubcategory, setCreatedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const isEditMode = !!subcategoryFormData?.id;

  useEffect(() => {
    if (createdSubcategory) {
      addToast({ title: t('SubcategoryForm.createdSuccess', { id: createdSubcategory.id }), color: 'success' });
      addSubcategory(createdSubcategory);
      setCreatedSubcategory(null);
      clearForm();
      setProcessing(false);
    } else if (editedSubcategory) {
      addToast({ title: t('SubcategoryForm.editedSuccess', { id: editedSubcategory.id }), color: 'success' });
      setEditedSubcategory(null);
      clearForm();
      setProcessing(false);
    }
  }, [addSubcategory, clearForm, createdSubcategory, editedSubcategory, addToast, t]);

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    if (isEditMode) {
      const updatedAccocreatedSubcategory = await editSubcategory(formData);
      setEditedSubcategory(updatedAccocreatedSubcategory);
    } else {
      const createdSubcategory = await createSubcategory(formData);
      setCreatedSubcategory(createdSubcategory);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {isEditMode ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.subcategory')}
            </ModalHeader>
            <ModalBody>
              <form className="flex flex-col gap-4" action={submitHandler}>
                {isEditMode && (
                  <div className="hidden">
                    <Input id="id" name="id" type="text" value={`${subcategoryFormData?.id}`} readOnly />
                  </div>
                )}
                <Input
                  id="name"
                  name="name"
                  fullWidth
                  isRequired
                  labelPlacement="outside-top"
                  label={t('CategoryForm.name')}
                  defaultValue={trySystemTranslation(subcategoryFormData?.name ?? '')}
                />
                <Select
                  label={t('SubcategoryForm.belongsTo')}
                  id="parentCategoryId"
                  name="parentCategoryId"
                  defaultSelectedKeys={
                    subcategoryFormData ? [subcategoryFormData.parentCategoryId.toString()] : undefined
                  }
                  isRequired
                  labelPlacement="outside"
                  placeholder={t('TransactionForm.selectCategory')}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id} hidden={category.readOnly}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>

                <Button onPress={onClose} type="submit" color="primary" isLoading={processing}>
                  {isEditMode ? t('Generics.edit') : t('Generics.save')}
                </Button>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
