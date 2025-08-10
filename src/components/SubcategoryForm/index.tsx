'use client';

import { useEffect, useState } from 'react';
import { Label, Modal, Select, TextInput } from 'flowbite-react';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { SubCategoryResponse } from '@/types/dto';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { createSubcategory, editSubcategory } from '@/lib/actions/subcategories';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { useTranslations } from 'next-intl';
import { ToastType } from '@/components/Toast';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';

export const SubcategoryForm = () => {
  const t = useTranslations();
  const trySystemTranslation = useTrySystemTranslations();
  const { showToast } = useToaster();
  const { subcategoryFormData, isOpen, closeSubcategoryForm } = useSubcategoryForm();

  const { categories, addSubcategory } = useCategories();
  const [createdSubcategory, setCreatedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const isEditMode = !!subcategoryFormData?.id;

  useEffect(() => {
    if (createdSubcategory) {
      showToast(t('SubcategoryForm.createdSuccess', { id: createdSubcategory.id }), ToastType.Success);
      addSubcategory(createdSubcategory);
      setCreatedSubcategory(null);
      closeSubcategoryForm();
      setProcessing(false);
    } else if (editedSubcategory) {
      showToast(t('SubcategoryForm.editedSuccess', { id: editedSubcategory.id }), ToastType.Success);
      setEditedSubcategory(null);
      closeSubcategoryForm();
      setProcessing(false);
    }
  }, [addSubcategory, closeSubcategoryForm, createdSubcategory, editedSubcategory, showToast, t]);

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
    <Modal show={isOpen} size="2xl" onClose={closeSubcategoryForm} popup>
      <Modal.Header as={'div'} className="m-4">
        {isEditMode ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.subcategory')}
      </Modal.Header>
      <Modal.Body>
        <form className="flex flex-col gap-4" action={submitHandler}>
          {isEditMode && (
            <div className="hidden">
              <div className="mb-2 block">
                <Label htmlFor="id" value="ID" />
              </div>
              <TextInput id="id" name="id" type="text" value={subcategoryFormData?.id || undefined} readOnly shadow />
            </div>
          )}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value={t('SubcategoryForm.name')} />
            </div>
            <TextInput
              id="name"
              name="name"
              type="text"
              defaultValue={trySystemTranslation(subcategoryFormData?.name ?? '')}
              required
              shadow
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="parentCategoryId" value={t('SubcategoryForm.belongsTo')} />
            </div>
            <Select
              id="parentCategoryId"
              name="parentCategoryId"
              defaultValue={subcategoryFormData?.parentCategoryId ?? undefined}
              required
            >
              <option value={undefined}>{t('SubcategoryForm.selectCategory')}</option>
              {categories
                .filter((cat) => !cat.readOnly)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Select>
          </div>

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {isEditMode ? t('Generics.edit') : t('Generics.save')}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
