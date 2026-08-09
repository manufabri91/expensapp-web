'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { getCategories } from '@/lib/actions/categories';
import { getSubcategories } from '@/lib/actions/subcategories';
import { CategoryResponse, SubCategoryResponse } from '@/types/dto';

interface CategoriesContextProps {
  categories: CategoryResponse[];
  subcategories: SubCategoryResponse[];
  addCategory: (category: CategoryResponse) => void;
  addSubcategory: (subcategory: SubCategoryResponse) => void;
  deleteCategory: (id: number) => void;
  deleteSubcategory: (id: number) => void;
  refetchAll: () => Promise<void>;
  getSubcategoriesByCategoryId: (categoryId: number) => SubCategoryResponse[];
}

const CategoriesContext = createContext<CategoriesContextProps>({
  categories: [],
  subcategories: [],
  addCategory: () => {},
  addSubcategory: () => {},
  deleteCategory: () => {},
  deleteSubcategory: () => {},
  refetchAll: async () => {},
  getSubcategoriesByCategoryId: () => [],
});

const useCategories = (): CategoriesContextProps => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

const CategoriesProvider: React.FC<{
  children: ReactNode;
  initialCategories: CategoryResponse[];
  initialSubcategories: SubCategoryResponse[];
}> = ({ children, initialCategories, initialSubcategories }) => {
  const [categories, setCategories] = useState<CategoryResponse[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<SubCategoryResponse[]>(initialSubcategories);

  useEffect(() => {
    setCategories(initialCategories);
    // initialCategories/initialSubcategories are re-fetched per request in AppProviders (e.g. on
    // login/logout) - resync whenever they change instead of only using them on first mount.
  }, [initialCategories]);

  useEffect(() => {
    setSubcategories(initialSubcategories);
  }, [initialSubcategories]);

  const addCategory = (category: CategoryResponse) => {
    setCategories((prev) => [...prev, category]);
  };

  const deleteCategory = (id: number) => {
    const newCategories = categories.filter((c) => c.id !== id);
    setCategories(newCategories);
  };

  const addSubcategory = (subCategory: SubCategoryResponse) => {
    setSubcategories((prev) => [...prev, subCategory]);
  };

  const deleteSubcategory = (id: number) => {
    const newSubcategories = subcategories.filter((c) => c.id !== id);
    setSubcategories(newSubcategories);
  };

  const refetchAll = async () => {
    const [fetchedCategories, fetchedSubcategories] = await Promise.all([getCategories(), getSubcategories()]);
    setCategories(fetchedCategories);
    setSubcategories(fetchedSubcategories);
  };

  const getSubcategoriesByCategoryId = (categoryId: number): SubCategoryResponse[] => {
    return subcategories.filter((sub) => sub.parentCategoryId === categoryId);
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        subcategories,
        addCategory,
        addSubcategory,
        deleteCategory,
        deleteSubcategory,
        refetchAll,
        getSubcategoriesByCategoryId,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export { CategoriesProvider, useCategories };
