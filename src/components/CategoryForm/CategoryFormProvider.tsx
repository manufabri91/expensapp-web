'use client';

import { useOverlayState, type UseOverlayStateReturn } from '@heroui/react';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CategoryForm } from '@/components/CategoryForm';
import { CategoryResponse } from '@/types/dto';

interface CategoryFormContextProps {
  overlayState: UseOverlayStateReturn;
  showCategoryForm: (Category?: CategoryResponse) => void;
  clearForm: () => void;
  categoryFormData: CategoryResponse | undefined;
}

const CategoryFormContext = createContext<CategoryFormContextProps | undefined>(undefined);

export const CategoryFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categoryFormData, setCategoryFormData] = useState<CategoryResponse | undefined>();
  const overlayState = useOverlayState();

  const showCategoryForm = useMemo(
    () => (category?: CategoryResponse) => {
      setCategoryFormData(category);
      overlayState.open();
    },
    [setCategoryFormData]
  );

  const clearForm = useMemo(
    () => () => {
      setCategoryFormData(undefined);
    },
    [setCategoryFormData]
  );

  return (
    <CategoryFormContext.Provider
      value={{ showCategoryForm, clearForm, categoryFormData, overlayState }}
    >
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
