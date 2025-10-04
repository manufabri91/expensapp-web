'use client';

import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
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

  const { categories, addSubcategory, refetchAll } = useCategories();
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

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>, cb?: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProcessing(true);
    try {
      if (isEditMode) {
        const updatedAccocreatedSubcategory = await editSubcategory(formData);
        setEditedSubcategory(updatedAccocreatedSubcategory);
        await refetchAll();
        if (cb) cb();
      } else {
        const createdSubcategory = await createSubcategory(formData);
        setCreatedSubcategory(createdSubcategory);
        if (cb) cb();
      }
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('AccountForm.unexpectedError'), color: 'danger' });
      }
      setEditedSubcategory(null);
      setCreatedSubcategory(null);
      setProcessing(false);
      clearForm();
      if (cb) cb();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <form onSubmit={(e) => submitHandler(e, onClose)}>
            <ModalHeader>
              {isEditMode ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.subcategory')}
            </ModalHeader>
            <ModalBody>
              {isEditMode && (
                <div className="hidden">
                  <Input id="id" name="id" type="text" value={`${subcategoryFormData?.id}`} readOnly />
                </div>
              )}
              <Input
                size="lg"
                id="name"
                name="name"
                fullWidth
                isRequired
                labelPlacement="outside-top"
                label={t('CategoryForm.name')}
                defaultValue={trySystemTranslation(subcategoryFormData?.name ?? '')}
              />
              <Select
                size="lg"
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
            </ModalBody>
            <ModalFooter>
              {!processing && (
                <Button type="submit" color="primary" fullWidth>
                  {isEditMode ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isLoading disabled fullWidth>
                  {isEditMode ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
