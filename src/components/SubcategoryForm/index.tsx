'use client';

import { InputGroup, Label, ListBox, Modal, Select, TextField, toast } from '@heroui/react';
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
  const { subcategoryFormData, clearForm, overlayState } = useSubcategoryForm();

  const { categories, addSubcategory, refetchAll } = useCategories();
  const [createdSubcategory, setCreatedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<SubCategoryResponse | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const isEditMode = !!subcategoryFormData?.id;

  useEffect(() => {
    if (createdSubcategory) {
      toast.success(t('SubcategoryForm.createdSuccess', { id: createdSubcategory.id }));
      addSubcategory(createdSubcategory);
      setCreatedSubcategory(null);
      clearForm();
      setProcessing(false);
    } else if (editedSubcategory) {
      toast.success(t('SubcategoryForm.editedSuccess', { id: editedSubcategory.id }));
      setEditedSubcategory(null);
      clearForm();
      setProcessing(false);
    }
  }, [addSubcategory, clearForm, createdSubcategory, editedSubcategory, t]);

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
        toast.danger(error.message);
      } else {
        toast.danger(t('AccountForm.unexpectedError'));
      }
      setEditedSubcategory(null);
      setCreatedSubcategory(null);
      setProcessing(false);
      clearForm();
      if (cb) cb();
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {isEditMode ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.subcategory')}
            </Modal.Heading>
          </Modal.Header>
          <form onSubmit={(e) => submitHandler(e, () => overlayState.close())}>
            <Modal.Body className="flex flex-col gap-4">
              {isEditMode && (
                <input id="id" name="id" type="hidden" value={`${subcategoryFormData?.id}`} readOnly />
              )}
              <TextField name="name" isRequired defaultValue={trySystemTranslation(subcategoryFormData?.name ?? '')} fullWidth>
                <Label>{t('CategoryForm.name')}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input id="name" type="text" />
                </InputGroup>
              </TextField>
              <Select
                id="parentCategoryId"
                name="parentCategoryId"
                defaultSelectedKey={
                  subcategoryFormData ? subcategoryFormData.parentCategoryId.toString() : undefined
                }
                isRequired
                placeholder={t('TransactionForm.selectCategory')}
                variant="secondary"
              >
                <Label>{t('SubcategoryForm.belongsTo')}</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {categories.map((category) => (
                      <ListBox.Item
                        key={category.id}
                        id={category.id.toString()}
                        textValue={category.name}
                        hidden={category.readOnly}
                      >
                        {category.name}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </Modal.Body>
            <Modal.Footer>
              {!processing && (
                <Button type="submit" variant="primary" fullWidth>
                  {isEditMode ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isDisabled fullWidth>
                  {isEditMode ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
