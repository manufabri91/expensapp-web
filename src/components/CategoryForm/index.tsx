'use client';

import { ErrorMessage, FieldError, InputGroup, Label, Modal, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ColorPicker, IconPickerFormField } from '@/components';
import { Button } from '@/components/Button';
import { useCategoryForm } from '@/components/CategoryForm/CategoryFormProvider';

import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { createCategory, editCategory } from '@/lib/actions/categories';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { categoryFormSchema, CategoryFormValues } from '@/schemas/category';
import { Icon } from '@/types/enums/icon';
import { TransactionType } from '@/types/enums/transactionType';

type CategoryFormInput = z.input<typeof categoryFormSchema>;

const defaultValues: CategoryFormInput = {
  name: '',
  type: TransactionType.EXPENSE,
  iconName: Icon.NONE,
  color: '',
};

export const CategoryForm = () => {
  const t = useTranslations();
  const { categoryFormData, clearForm, overlayState } = useCategoryForm();
  const { refetchAll } = useCategories();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (!overlayState.isOpen) return;
    reset(
      categoryFormData
        ? {
            id: categoryFormData.id,
            name: categoryFormData.name,
            type: categoryFormData.type,
            iconName: categoryFormData.iconName ?? Icon.NONE,
            color: categoryFormData.color ?? '',
          }
        : defaultValues
    );
  }, [overlayState.isOpen, categoryFormData, reset]);

  const onValid = async (data: CategoryFormValues) => {
    try {
      if (!categoryFormData) {
        const created = await createCategory(data);
        await refetchAll();
        toast.success(t('CategoryForm.createdSuccess', { id: created.id }));
      } else {
        const edited = await editCategory(data);
        await refetchAll();
        toast.success(t('CategoryForm.editedSuccess', { id: edited.id }));
      }
      clearForm();
      overlayState.close();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('CategoryForm.unexpectedError'));
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
          <form onSubmit={handleSubmit(onValid)}>
            <Modal.Body className="flex flex-col gap-4 py-2">
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <>
                    <TransactionTypeSelector initialValue={field.value} onSelect={field.onChange} hideTransfers />
                    {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                  </>
                )}
              />
              <div className="grid grid-cols-5 gap-4">
                <Controller
                  control={control}
                  name="iconName"
                  render={({ field }) => (
                    <IconPickerFormField selectedKey={field.value} onSelectionChange={field.onChange} />
                  )}
                />
                <div className="col-span-3">
                  <Controller
                    control={control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <TextField
                        isRequired
                        fullWidth
                        isInvalid={fieldState.invalid}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        <Label>{t('CategoryForm.name')}</Label>
                        <InputGroup variant="secondary">
                          <InputGroup.Input type="text" />
                        </InputGroup>
                        {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                      </TextField>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name="color"
                  render={({ field, fieldState }) => (
                    <div>
                      <ColorPicker color={field.value} onChange={field.onChange} />
                      {fieldState.error?.message && <ErrorMessage>{t(fieldState.error.message)}</ErrorMessage>}
                    </div>
                  )}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              {!isSubmitting && (
                <Button type="submit" variant="primary" fullWidth>
                  {categoryFormData ? t('Generics.edit') : t('Generics.save')}
                </Button>
              )}
              {isSubmitting && (
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
