import React from 'react';
import { CategoriesAccordion } from '@/app/manage/components/Categories/components/CategoriesAccordion';
import { getCategories } from '@/lib/actions/categories';

export const CategoriesDetails = async () => {
  const categories = await getCategories();

  return <CategoriesAccordion categories={categories} />;
};
