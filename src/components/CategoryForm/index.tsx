'use client';

import { Input } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import { addToast } from '@heroui/toast';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ColorPicker, IconPickerFormField } from '@/components';
import { Button } from '@/components/Button';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';

import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { createCategory, editCategory } from '@/lib/actions/categories';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { CategoryResponse } from '@/types/dto';
import { TransactionType } from '@/types/enums/transactionType';

export const CategoryForm = () => {
  const t = useTranslations();
  const { categoryFormData, clearForm, isOpen, onOpenChange } = useCategoryForm();
  const { refetchAll } = useCategories();
  const [createdCategory, setCreatedCategory] = useState<CategoryResponse | null>(null);
  const [editedCategory, setEditedCategory] = useState<CategoryResponse | null>(null);
  const [type, setType] = useState<TransactionType>(categoryFormData?.type || TransactionType.EXPENSE);
  const [processing, setProcessing] = useState<boolean>(false);
  const [color, setColor] = useState<string>(categoryFormData?.color ?? '');

  useEffect(() => {
    if (createdCategory) {
      addToast({ title: t('CategoryForm.createdSuccess', { id: createdCategory.id }), color: 'success' });
      setCreatedCategory(null);
      clearForm();
      setProcessing(false);
      setColor('');
    } else if (editedCategory) {
      addToast({ title: t('CategoryForm.editedSuccess', { id: editedCategory.id }), color: 'success' });
      setEditedCategory(null);
      clearForm();
      setProcessing(false);
      setColor('');
      refetchAll();
    }
  }, [clearForm, createdCategory, editedCategory, addToast, refetchAll, t]);

  useEffect(() => {
    if (categoryFormData) {
      setType(categoryFormData.type);
      setColor(categoryFormData.color ?? '');
    }
  }, [categoryFormData]);

  useEffect(() => {
    if (!isOpen) {
      setType(TransactionType.EXPENSE);
      setCreatedCategory(null);
      setEditedCategory(null);
      setProcessing(false);
      setColor('');
    }
  }, [isOpen]);

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    try {
      if (!categoryFormData) {
        const createdCategory = await createCategory(formData);
        await refetchAll();
        setCreatedCategory(createdCategory);
      } else {
        const updatedAccocreatedCategory = await editCategory(formData);
        await refetchAll();
        setEditedCategory(updatedAccocreatedCategory);
      }
    } catch (error) {
      if (error instanceof Error) {
        addToast({ title: error.message, color: 'danger' });
      } else {
        addToast({ title: t('CategoryForm.unexpectedError'), color: 'danger' });
      }
      setCreatedCategory(null);
      setEditedCategory(null);
      setProcessing(false);
      clearForm();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader as={'div'} className="m-4">
              <h3>
                {categoryFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.category')}
              </h3>
            </ModalHeader>
            <ModalBody>
              <form className="flex flex-col gap-4" action={submitHandler}>
                {!!categoryFormData && (
                  <div className="hidden">
                    <Input id="id" name="id" type="text" value={`${categoryFormData?.id}`} readOnly />
                  </div>
                )}
                <div>
                  <TransactionTypeSelector initialValue={type} onSelect={setType} hideTransfers />
                </div>
                <div className="flex w-full items-center justify-center gap-3">
                  <div className="w-1/3">
                    <IconPickerFormField id="iconName" name="iconName" initialValue={categoryFormData?.iconName} />
                  </div>
                  <div className="w-3/6">
                    <Input
                      id="name"
                      name="name"
                      fullWidth
                      isRequired
                      labelPlacement="outside-top"
                      label={t('CategoryForm.name')}
                      defaultValue={categoryFormData?.name}
                    />
                  </div>
                  <ColorPicker color={color} onChange={setColor} />
                  <div className="hidden">
                    <Input id="color" name="color" fullWidth value={color} onChange={(e) => setColor(e.target.value)} />
                  </div>
                </div>

                <Button onPress={onClose} type="submit" color="primary" isLoading={processing} className="my-6">
                  {categoryFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
