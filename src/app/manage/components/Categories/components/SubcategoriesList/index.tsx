import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import {
  CreateSubcategoryButton,
  DeleteSubcategoryButton,
  EditSubcategoryButton,
} from '@/app/manage/components/Categories/components/SubcategoryActions';
import { SYSTEM_TRANSLATION_KEYS } from '@/constants';
import { useCategories } from '@/lib/providers/CategoriesProvider';

interface Props {
  parentCategoryId: number;
}

export const SubcategoriesList = ({ parentCategoryId }: Props) => {
  const t = useTranslations();
  const { getSubcategoriesByCategoryId } = useCategories();

  const data = getSubcategoriesByCategoryId(parentCategoryId);

  return (
    <Card className="my-4" variant="secondary">
      <Card.Header>
        <div className="flex items-center justify-between">
          <h5 className="text-foreground mr-4 font-medium">{t('Manage.categories.subcategoriesTitle')}</h5>
          <CreateSubcategoryButton parentCategoryId={parentCategoryId} />
        </div>
      </Card.Header>
      <Card.Content>
        {data &&
          data.map((subcategory, idx) => (
            <div
              key={subcategory.id}
              className={`text-foreground text-xs ${idx < data.length - 1 ? 'border-b dark:border-slate-600' : ''}`}
            >
              <div className="my-4 flex items-center justify-between">
                {SYSTEM_TRANSLATION_KEYS.includes(subcategory.name)
                  ? t(`System.${subcategory.name}`)
                  : subcategory.name}
                <div className="flex gap-2">
                  <EditSubcategoryButton subcategory={subcategory} />
                  <DeleteSubcategoryButton subcategoryId={subcategory.id} />
                </div>
              </div>
            </div>
          ))}
      </Card.Content>
    </Card>
  );
};
