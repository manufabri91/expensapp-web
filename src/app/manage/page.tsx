import { getTranslations } from 'next-intl/server';
import { Accounts } from '@/app/manage/components/Accounts';
import { Categories } from '@/app/manage/components/Categories';
import { AccountFormProvider } from '@/components/AccountForm/AccountFormProvider';
import { CategoryFormProvider } from '@/components/CategoryForm/CategoryFormProvider';
import { SubcategoryFormProvider } from '@/components/SubcategoryForm/SubcategoryFormProvider';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.manage' });

  return {
    title: {
      default: t('title'),
    },
    description: t('description'),
  };
}

export default async function ManagePage() {
  const t = await getTranslations('Manage');
  return (
    <CategoryFormProvider>
      <SubcategoryFormProvider>
        <AccountFormProvider>
          <main className="max-w-[100vw] p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h2>
            <Accounts />
            <Categories />
          </main>
        </AccountFormProvider>
      </SubcategoryFormProvider>
    </CategoryFormProvider>
  );
}
