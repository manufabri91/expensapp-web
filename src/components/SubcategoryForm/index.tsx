'use client';

import { FieldError, InputGroup, Label, ListBox, Modal, Select, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/Button';
import { useSubcategoryForm } from '@/components/SubcategoryForm/SubcategoryFormProvider';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { createSubcategory, editSubcategory } from '@/lib/actions/subcategories';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { subcategoryFormSchema, SubcategoryFormValues } from '@/schemas/subcategory';

const defaultValues: SubcategoryFormValues = { name: '', parentCategoryId: 0 };

export const SubcategoryForm = () => {
  const t = useTranslations();
  const trySystemTranslation = useTrySystemTranslations();
  const { subcategoryFormData, clearForm, overlayState } = useSubcategoryForm();

  const { categories, addSubcategory, refetchAll } = useCategories();
  const isEditMode = !!subcategoryFormData?.id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategoryFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (!overlayState.isOpen || !subcategoryFormData) return;
    reset({
      id: isEditMode ? subcategoryFormData.id : undefined,
      name: isEditMode ? trySystemTranslation(subcategoryFormData.name) : '',
      parentCategoryId: subcategoryFormData.parentCategoryId,
    });
  }, [overlayState.isOpen, subcategoryFormData, isEditMode, trySystemTranslation, reset]);

  const onValid = async (data: SubcategoryFormValues) => {
    try {
      if (isEditMode) {
        const edited = await editSubcategory(data);
        await refetchAll();
        toast.success(t('SubcategoryForm.editedSuccess', { id: edited.id }));
      } else {
        const created = await createSubcategory(data);
        addSubcategory(created);
        toast.success(t('SubcategoryForm.createdSuccess', { id: created.id }));
      }
      clearForm();
      overlayState.close();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : t('SubcategoryForm.unexpectedError'));
    }
  };

  if (!overlayState.isOpen) return null;

  return (
    <Modal>
      <Modal.Backdrop variant="blur" isOpen={overlayState.isOpen} onOpenChange={overlayState.setOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isEditMode ? t('Generics.edit') : t('Generics.new.female')} {t('Generics.subcategory')}
              </Modal.Heading>
            </Modal.Header>
            <form onSubmit={handleSubmit(onValid)}>
              <Modal.Body className="flex flex-col gap-4">
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
                <Controller
                  control={control}
                  name="parentCategoryId"
                  render={({ field, fieldState }) => (
                    <Select
                      isRequired
                      placeholder={t('TransactionForm.selectCategory')}
                      variant="secondary"
                      isInvalid={fieldState.invalid}
                      selectedKey={field.value ? field.value.toString() : undefined}
                      onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                      onBlur={field.onBlur}
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
                      {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
                    </Select>
                  )}
                />
              </Modal.Body>
              <Modal.Footer>
                {!isSubmitting && (
                  <Button type="submit" variant="primary" fullWidth>
                    {isEditMode ? t('Generics.edit') : t('Generics.save')}
                  </Button>
                )}
                {isSubmitting && (
                  <Button type="button" isDisabled fullWidth>
                    {isEditMode ? t('Generics.editing') : t('Generics.saving')}...
                  </Button>
                )}
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
