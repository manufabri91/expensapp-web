'use client';

import { useEffect, useState } from 'react';
import { Label, Modal, TextInput } from 'flowbite-react';

import { Button, ButtonVariant } from '@/components/Button';
import { useToaster } from '@/components/Toast/ToastProvider';
import { CategoryResponse } from '@/types/dto';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { createCategory, editCategory } from '@/lib/actions/categories';
import { IconPickerFormField } from '@/components/IconPicker';

export const CategoryForm = () => {
  const { showToast } = useToaster();
  const { categoryFormData, isOpen, closeCategoryForm } = useCategoryForm();
  const { addCategory } = useCategories();
  const [createdCategory, setCreatedCategory] = useState<CategoryResponse | null>(null);
  const [editedCategory, setEditedCategory] = useState<CategoryResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (createdCategory) {
      showToast(`Created Category with ID: ${createdCategory.id}`);
      setCreatedCategory(null);
      closeCategoryForm();
      setProcessing(false);
    } else if (editedCategory) {
      showToast(`Edited Category with ID: ${editedCategory.id}`);
      setEditedCategory(null);
      closeCategoryForm();
      setProcessing(false);
    }
  }, [closeCategoryForm, createdCategory, editedCategory, showToast]);

  const submitHandler = async (formData: FormData) => {
    setProcessing(true);
    if (!categoryFormData) {
      const createdCategory = await createCategory(formData);
      setCreatedCategory(createdCategory);
      addCategory(createdCategory);
    } else {
      const updatedAccocreatedCategory = await editCategory(formData);
      setEditedCategory(updatedAccocreatedCategory);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} size="2xl" onClose={closeCategoryForm} popup>
      <Modal.Header as={'div'} className="m-4">
        <h3>{categoryFormData ? 'Edit ' : 'Create '}Category</h3>
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
          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Category Name" />
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
          <div>
            <div className="mb-2 block">
              <Label htmlFor="color" value="Category Color" />
            </div>
            <TextInput id="color" name="color" type="text" defaultValue={categoryFormData?.color ?? ''} shadow />
          </div>

          <Button type="submit" variant={ButtonVariant.Primary} isProcessing={processing}>
            {categoryFormData ? 'Edit' : 'Create'}
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};
