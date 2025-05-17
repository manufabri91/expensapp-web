import { AccountFormProvider } from '@/components/AccountForm/AccountFormProvider';
import { Metadata } from 'next';
import { Categories } from '@/app/manage/components/Categories';
import { Accounts } from '@/app/manage/components/Accounts';
import { CategoryFormProvider } from '@/components/CategoryForm/CategoryFormProvider';
import { SubcategoryFormProvider } from '@/components/SubcategoryForm/SubcategoryFormProvider';

export const metadata: Metadata = {
  title: 'Accounts & Categories',
  description: 'Manage your accounts and categories',
};

export default function ManagePage() {
  return (
    <CategoryFormProvider>
      <SubcategoryFormProvider>
        <AccountFormProvider>
          <main className="max-w-[100vw] p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Manage Accounts & Categories</h2>
            <Accounts />
            <Categories />
          </main>
        </AccountFormProvider>
      </SubcategoryFormProvider>
    </CategoryFormProvider>
  );
}
