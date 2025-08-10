'use client';

import { useEffect, useState } from 'react';
import { Label, Modal, TextInput } from 'flowbite-react';
import { useTranslations } from 'next-intl';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { CategoryResponse } from '@/types/dto';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { createCategory, editCategory } from '@/lib/actions/categories';
import { IconPickerFormField } from '@/components/IconPicker';
import { TransactionType } from '@/types/enums/transactionType';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { ColorPicker } from '@/components/ColorPicker';
import { ToastType } from '@/components/Toast';

export const CategoryForm = () => {
  const t = useTranslations();
  const { showToast } = useToaster();
  const { categoryFormData, isOpen, closeCategoryForm } = useCategoryForm();
  const { refetchAll } = useCategories();
  const [createdCategory, setCreatedCategory] = useState<CategoryResponse | null>(null);
  const [editedCategory, setEditedCategory] = useState<CategoryResponse | null>(null);
  const [type, setType] = useState<TransactionType>(categoryFormData?.type || TransactionType.EXPENSE);
  const [processing, setProcessing] = useState<boolean>(false);
  const [color, setColor] = useState<string>(categoryFormData?.color ?? '');

  useEffect(() => {
    if (createdCategory) {
      showToast(t('CategoryForm.createdSuccess', { id: createdCategory.id }), ToastType.Success);
      setCreatedCategory(null);
      closeCategoryForm();
      setProcessing(false);
      setColor('');
    } else if (editedCategory) {
      showToast(t('CategoryForm.editedSuccess', { id: editedCategory.id }), ToastType.Success);
      setEditedCategory(null);
      closeCategoryForm();
      setProcessing(false);
      setColor('');
      refetchAll();
    }
  }, [closeCategoryForm, createdCategory, editedCategory, showToast, refetchAll, t]);

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
    if (!categoryFormData) {
      const createdCategory = await createCategory(formData);
      await refetchAll();
      setCreatedCategory(createdCategory);
    } else {
      const updatedAccocreatedCategory = await editCategory(formData);
      await refetchAll();
      setEditedCategory(updatedAccocreatedCategory);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="2xl" onClose={closeCategoryForm} popup>
      <Modal.Header as={'div'} className="m-4">
        <h3>
          {categoryFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.category')}
        </h3>
      </Modal.Header>
      <Modal.Body>
        <form className="flex flex-col gap-4" action={submitHandler}>
          {!!categoryFormData && (
            <div className="hidden">
              <div className="mb-2 block">
                <Label htmlFor="id" value="ID" />
              </div>
              <TextInput id="id" name="id" type="text" value={categoryFormData?.id} readOnly shadow />
            </div>
          )}
          <div className="mb-2">
            <TransactionTypeSelector initialValue={type} onSelect={setType} hideTransfers />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value={t('CategoryForm.name')} />
            </div>
            <TextInput
              addon={
                <IconPickerFormField
                  id="iconName"
                  name="iconName"
                  initialValue={categoryFormData?.iconName}
                ></IconPickerFormField>
              }
              id="name"
              name="name"
              type="text"
              defaultValue={categoryFormData?.name}
              required
              shadow
            />
          </div>
          <div className="flex gap-2">
            <div className="mb-2 block">
              <Label htmlFor="color" value={t('CategoryForm.color')} />
            </div>
            <ColorPicker color={color} onChange={setColor} />
            <div className="hidden">
              <TextInput
                id="color"
                name="color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                shadow
              />
            </div>
          </div>

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {categoryFormData ? t('Generics.edit') : t('Generics.save')}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
