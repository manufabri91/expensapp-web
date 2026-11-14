import { FieldError, InputGroup, Label, ListBox, Select, Switch, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { TransactionMode } from '@/components/TransactionModeSelector';
import { useTrySystemTranslations } from '@/hooks/useTrySystemTranslations';
import { useCategories } from '@/lib/providers/CategoriesProvider';
import { TransactionType } from '@/types/enums/transactionType';
import { TransactionScheduleFields } from './TransactionScheduleFields';
import { TransactionFormValues } from '../types';

export const TransactionDetailsFields = ({
  mode,
  onTotalsChange,
}: {
  mode: TransactionMode;
  onTotalsChange: () => void;
}) => {
  const t = useTranslations();
  const { control, setValue } = useFormContext<TransactionFormValues>();
  const [watchedType, watchedCategory] = useWatch({ control, name: ['type', 'category'] });
  const { categories, subcategories } = useCategories();
  const trySystemTranslations = useTrySystemTranslations();
  const filteredSubcategories = subcategories.filter((subcategory) => subcategory.parentCategoryId === watchedCategory);
  return (
    <>
      {watchedType !== TransactionType.TRANSFER && (
        <>
          {' '}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <TextField
                isRequired
                fullWidth
                isInvalid={fieldState.invalid}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <Label>{t('Generics.description')}</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input type="text" ref={field.ref} />
                </InputGroup>
                {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
              </TextField>
            )}
          />
        </>
      )}
      <TransactionScheduleFields mode={mode} />
      {watchedType !== TransactionType.TRANSFER && (
        <>
          <Controller
            control={control}
            name="category"
            render={({ field, fieldState }) => (
              <Select
                isRequired
                variant="secondary"
                isInvalid={fieldState.invalid}
                selectedKey={field.value?.toString()}
                onSelectionChange={(key) => {
                  const categoryId = key ? Number(key) : undefined;
                  field.onChange(categoryId);
                  setValue('subcategory', undefined, { shouldDirty: true });
                }}
                onBlur={field.onBlur}
                placeholder={t('TransactionForm.selectCategory')}
              >
                <Label>{t('Generics.category')}</Label>
                <Select.Trigger ref={field.ref}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {categories
                      .filter((category) => category.type === watchedType)
                      .map((category) => (
                        <ListBox.Item key={category.id} id={category.id.toString()} textValue={category.name}>
                          {category.name}
                        </ListBox.Item>
                      ))}
                  </ListBox>
                </Select.Popover>
                {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
              </Select>
            )}
          />

          <Controller
            control={control}
            name="subcategory"
            render={({ field, fieldState }) => (
              <Select
                isRequired
                isDisabled={!watchedCategory}
                variant="secondary"
                isInvalid={fieldState.invalid}
                selectedKey={field.value?.toString()}
                onSelectionChange={(key) => field.onChange(key ? Number(key) : undefined)}
                onBlur={field.onBlur}
                placeholder={t('TransactionForm.selectSubcategory')}
              >
                <Label>{t('Generics.subcategory')}</Label>
                <Select.Trigger ref={field.ref}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {filteredSubcategories.map((subcategory) => (
                      <ListBox.Item
                        key={subcategory.id}
                        id={subcategory.id.toString()}
                        textValue={trySystemTranslations(subcategory.name)}
                      >
                        {trySystemTranslations(subcategory.name)}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
                {fieldState.error?.message && <FieldError>{t(fieldState.error.message)}</FieldError>}
              </Select>
            )}
          />
        </>
      )}

      {watchedType !== TransactionType.TRANSFER && (
        <details className="bg-surface rounded-xl p-3">
          <summary className="min-h-8 cursor-pointer font-medium">{t('AmountFlow.moreDetails')}</summary>
          <div className="pt-3">
            <Controller
              control={control}
              name="excludeFromTotals"
              render={({ field }) => (
                <Switch
                  size="sm"
                  isSelected={field.value}
                  onChange={(selected: boolean) => {
                    onTotalsChange();
                    field.onChange(selected);
                  }}
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <span>{t('TransactionForm.excludeFromTotals')}</span>
                  </Switch.Content>
                </Switch>
              )}
            />
          </div>
        </details>
      )}
    </>
  );
};
