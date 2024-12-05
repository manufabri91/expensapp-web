'use client';

import { CategoryResponse, SubCategoryResponse } from '@/types/dto';
import React, { createContext, useState, ReactNode, useContext } from 'react';

interface CategoriesContextProps {
  categories: CategoryResponse[];
  subcategories: SubCategoryResponse[];
  addCategory: (category: CategoryResponse) => void;
  addSubcategory: (subcategory: SubCategoryResponse) => void;
  deleteCategory: (id: number) => void;
  deleteSubcategory: (id: number) => void;
}

const CategoriesContext = createContext<CategoriesContextProps>({
  categories: [],
  subcategories: [],
  addCategory: () => {},
  addSubcategory: () => {},
  deleteCategory: () => {},
  deleteSubcategory: () => {},
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

  return (
    <CategoriesContext.Provider
      value={{ categories, subcategories, addCategory, addSubcategory, deleteCategory, deleteSubcategory }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export { CategoriesProvider, useCategories };
