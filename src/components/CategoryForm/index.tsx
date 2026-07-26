'use client';

import { InputGroup, Label, Modal, TextField, toast } from '@heroui/react';
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
  const { categoryFormData, clearForm, overlayState } = useCategoryForm();
  const { refetchAll } = useCategories();
  const [createdCategory, setCreatedCategory] = useState<CategoryResponse | null>(null);
  const [editedCategory, setEditedCategory] = useState<CategoryResponse | null>(null);
  const [type, setType] = useState<TransactionType>(categoryFormData?.type || TransactionType.EXPENSE);
  const [processing, setProcessing] = useState<boolean>(false);
  const [color, setColor] = useState<string>(categoryFormData?.color ?? '');

  useEffect(() => {
    if (createdCategory) {
      toast.success(t('CategoryForm.createdSuccess', { id: createdCategory.id }));
      setCreatedCategory(null);
      clearForm();
      setProcessing(false);
      setColor('');
    } else if (editedCategory) {
      toast.success(t('CategoryForm.editedSuccess', { id: editedCategory.id }));
      setEditedCategory(null);
      clearForm();
      setProcessing(false);
      setColor('');
      refetchAll();
    }
  }, [clearForm, createdCategory, editedCategory, refetchAll, t]);

  useEffect(() => {
    if (categoryFormData) {
      setType(categoryFormData.type);
      setColor(categoryFormData.color ?? '');
    }
  }, [categoryFormData]);

  useEffect(() => {
    if (!overlayState.isOpen) {
      setType(TransactionType.EXPENSE);
      setCreatedCategory(null);
      setEditedCategory(null);
      setProcessing(false);
      setColor('');
    }
  }, [overlayState.isOpen]);

  const submitHandler = async (formData: FormData, onSuccessSubmit?: () => void) => {
    setProcessing(true);
    try {
      if (!categoryFormData) {
        const createdCategory = await createCategory(formData);
        await refetchAll();
        setCreatedCategory(createdCategory);
        if (onSuccessSubmit) onSuccessSubmit();
      } else {
        const updatedAccocreatedCategory = await editCategory(formData);
        await refetchAll();
        setEditedCategory(updatedAccocreatedCategory);
        if (onSuccessSubmit) onSuccessSubmit();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.danger(error.message);
      } else {
        toast.danger(t('CategoryForm.unexpectedError'));
      }
      setCreatedCategory(null);
      setEditedCategory(null);
      setProcessing(false);
      clearForm();
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
              {categoryFormData ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.category')}
            </Modal.Heading>
          </Modal.Header>
          <form action={(data) => submitHandler(data, () => overlayState.close())}>
            <Modal.Body className="flex flex-col gap-4">
              {!!categoryFormData && (
                <div className="hidden">
                  <input id="id" name="id" type="hidden" value={`${categoryFormData?.id}`} readOnly />
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
                  <TextField name="name" isRequired defaultValue={categoryFormData?.name} fullWidth>
                    <Label>{t('CategoryForm.name')}</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.Input id="name" type="text" />
                    </InputGroup>
                  </TextField>
                </div>
                <ColorPicker color={color} onChange={setColor} />
                <input id="color" name="color" type="hidden" value={color} readOnly />
              </div>
            </Modal.Body>
            <Modal.Footer>
              {!processing && (
                <Button type="submit" variant="primary" fullWidth>
                  {categoryFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {processing && (
                <Button type="button" isDisabled fullWidth>
                  {categoryFormData ? t('Generics.editing') : t('Generics.saving')}...
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};
