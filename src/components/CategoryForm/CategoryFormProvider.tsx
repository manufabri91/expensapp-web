'use client';

import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CategoryForm } from '@/components/CategoryForm';
import { CategoryResponse } from '@/types/dto';

interface CategoryFormContextProps {
  isOpen: boolean;
  showCategoryForm: (Category?: CategoryResponse) => void;
  closeCategoryForm: () => void;
  categoryFormData: CategoryResponse | undefined;
}

const CategoryFormContext = createContext<CategoryFormContextProps | undefined>(undefined);

export const CategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categoryFormData, setCategoryFormData] = useState<CategoryResponse | undefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const showCategoryForm = useMemo(
    () => (category?: CategoryResponse) => {
      setCategoryFormData(category);
      setIsOpen(true);
    },
    [setCategoryFormData]
  );

  const closeCategoryForm = useMemo(
    () => () => {
      setCategoryFormData(undefined);
      setIsOpen(false);
    },
    [setCategoryFormData]
  );

  return (
    <CategoryFormContext.Provider value={{ showCategoryForm, closeCategoryForm, categoryFormData, isOpen }}>
      {children}
      <CategoryForm />
    </CategoryFormContext.Provider>
  );
};

export const useCategoryForm = (): CategoryFormContextProps => {
  const context = useContext(CategoryFormContext);
  if (!context) {
    throw new Error('useCategoryForm must be used within a CategoryFormProvider');
  }
  return context;
};
